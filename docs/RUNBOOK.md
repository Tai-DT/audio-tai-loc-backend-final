# Audio Tài Lộc Production Runbook

## Table of Contents
1. [Overview](#overview)
2. [Deployment Procedures](#deployment-procedures)
3. [Rollback Procedures](#rollback-procedures)
4. [Monitoring & Alerts](#monitoring--alerts)
5. [Incident Response](#incident-response)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Emergency Contacts](#emergency-contacts)

## Overview

This runbook provides operational procedures for the Audio Tài Lộc backend system. It covers deployment, rollback, monitoring, and incident response procedures.

### System Architecture
- **Application**: NestJS backend API
- **Database**: PostgreSQL 15 (Primary) + Read replicas
- **Cache**: Redis 7.x
- **Container**: Docker with Docker Compose
- **Process Manager**: PM2
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack

## Deployment Procedures

### Pre-Deployment Checklist
- [ ] All tests passing in CI/CD pipeline
- [ ] Code reviewed and approved
- [ ] Database migrations tested in staging
- [ ] API documentation updated
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Backup of current production database
- [ ] Monitoring alerts configured

### Blue-Green Deployment Process

#### 1. Prepare New Environment (Blue)
```bash
# SSH to production server
ssh deploy@production-server

# Pull latest code
cd /app/audio-tai-loc-blue
git pull origin main
git checkout tags/v1.0.0

# Build Docker image
docker build -t audio-tai-loc-backend:v1.0.0 .
docker tag audio-tai-loc-backend:v1.0.0 audio-tai-loc-backend:latest-blue

# Update environment variables
cp .env.production .env
# Edit any new environment variables if needed
```

#### 2. Deploy to Blue Environment
```bash
# Start blue environment
docker-compose -f docker-compose.blue.yml up -d

# Run database migrations
docker exec audio-tai-loc-blue npm run db:migrate:prod

# Health check
curl http://localhost:3002/health/detailed
```

#### 3. Smoke Tests
```bash
# Run smoke tests
npm run test:smoke -- --env=blue

# Check critical endpoints
./scripts/smoke-test.sh blue
```

#### 4. Switch Traffic to Blue
```bash
# Update NGINX configuration
sudo cp /etc/nginx/sites-available/audio-tai-loc-blue /etc/nginx/sites-available/audio-tai-loc
sudo nginx -t
sudo systemctl reload nginx

# Verify traffic routing
curl https://api.audiotailoc.com/health
```

#### 5. Monitor New Deployment
```bash
# Watch logs
docker logs -f audio-tai-loc-blue

# Monitor metrics
open https://grafana.audiotailoc.com/d/backend-overview
```

#### 6. Cleanup Old Environment
```bash
# After 24 hours of stable operation
docker-compose -f docker-compose.green.yml down
docker image prune -f
```

### Deployment Using PM2

```bash
# Build application
npm run build

# Deploy with PM2
pm2 deploy ecosystem.config.js production

# Or manual PM2 deployment
pm2 stop audio-tai-loc
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
```bash
# Switch NGINX back to green
sudo cp /etc/nginx/sites-available/audio-tai-loc-green /etc/nginx/sites-available/audio-tai-loc
sudo systemctl reload nginx

# Stop blue environment
docker-compose -f docker-compose.blue.yml down
```

### Database Rollback
```bash
# Check migration status
npm run db:migrate:status

# Rollback last migration
npm run db:migrate:rollback

# For specific migration rollback
npm run db:migrate:rollback -- --to=20240101120000-migration-name
```

### Full System Rollback
```bash
# 1. Switch to previous version
git checkout tags/v0.9.0

# 2. Rebuild and deploy
docker build -t audio-tai-loc-backend:rollback .
docker-compose -f docker-compose.rollback.yml up -d

# 3. Restore database backup if needed
pg_restore -h localhost -U postgres -d audio_tai_loc_prod backup_v0.9.0.dump

# 4. Clear Redis cache
docker exec audio-tai-loc-redis redis-cli FLUSHALL

# 5. Update NGINX
sudo systemctl reload nginx
```

## Monitoring & Alerts

### Key Metrics to Monitor

#### Application Metrics
| Metric | Normal Range | Warning | Critical |
|--------|-------------|---------|----------|
| Response Time (p95) | < 200ms | > 500ms | > 1000ms |
| Request Rate | 100-1000 req/s | > 2000 req/s | > 3000 req/s |
| Error Rate | < 0.1% | > 1% | > 5% |
| CPU Usage | < 60% | > 80% | > 90% |
| Memory Usage | < 70% | > 85% | > 95% |

#### Database Metrics
| Metric | Normal Range | Warning | Critical |
|--------|-------------|---------|----------|
| Connection Pool | < 80% | > 90% | > 95% |
| Query Time (p95) | < 50ms | > 100ms | > 500ms |
| Active Connections | < 100 | > 150 | > 190 |
| Replication Lag | < 1s | > 5s | > 30s |

#### Redis Metrics
| Metric | Normal Range | Warning | Critical |
|--------|-------------|---------|----------|
| Memory Usage | < 70% | > 85% | > 95% |
| Hit Rate | > 90% | < 80% | < 60% |
| Evicted Keys | < 100/min | > 1000/min | > 10000/min |

### Alert Configuration

#### Prometheus Alerts
```yaml
# /etc/prometheus/alerts/audio-tai-loc.yml
groups:
  - name: audio_tai_loc_alerts
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value | humanizePercentage }} of connections used"
```

#### Grafana Dashboard URLs
- **Overview**: https://grafana.audiotailoc.com/d/backend-overview
- **API Performance**: https://grafana.audiotailoc.com/d/api-performance
- **Database**: https://grafana.audiotailoc.com/d/postgres-overview
- **Redis**: https://grafana.audiotailoc.com/d/redis-overview
- **Business Metrics**: https://grafana.audiotailoc.com/d/business-metrics

### Log Monitoring

#### Key Log Patterns to Watch
```bash
# Error patterns
tail -f /var/log/audio-tai-loc/error.log | grep -E "ERROR|CRITICAL|FATAL"

# Payment failures
tail -f /var/log/audio-tai-loc/app.log | grep -E "payment.*failed|payment.*error"

# Database issues
tail -f /var/log/audio-tai-loc/app.log | grep -E "database.*error|connection.*failed"

# Authentication failures
tail -f /var/log/audio-tai-loc/app.log | grep -E "auth.*failed|unauthorized"
```

## Incident Response

### Severity Levels
- **P1 (Critical)**: Complete system outage or data loss
- **P2 (High)**: Major functionality broken, significant performance degradation
- **P3 (Medium)**: Minor functionality broken, moderate performance issues
- **P4 (Low)**: Cosmetic issues, minor bugs

### Response Procedures

#### P1 - Critical Incident
1. **Immediate Actions** (0-15 minutes)
   ```bash
   # Check system status
   ./scripts/health-check-all.sh
   
   # Check recent deployments
   git log --oneline -10
   pm2 list
   
   # Review error logs
   tail -n 1000 /var/log/audio-tai-loc/error.log
   ```

2. **Diagnosis** (15-30 minutes)
   - Check monitoring dashboards
   - Review recent changes
   - Identify root cause

3. **Resolution** (30+ minutes)
   - Execute rollback if needed
   - Apply hotfix if identified
   - Scale resources if capacity issue

4. **Communication**
   - Update status page
   - Notify stakeholders via Slack
   - Send customer communication if needed

#### P2-P4 Incidents
Follow standard incident response but with relaxed timelines.

## Maintenance Procedures

### Database Maintenance
```bash
# Weekly vacuum
docker exec audio-tai-loc-db psql -U postgres -d audio_tai_loc_prod -c "VACUUM ANALYZE;"

# Monthly reindex
docker exec audio-tai-loc-db psql -U postgres -d audio_tai_loc_prod -c "REINDEX DATABASE audio_tai_loc_prod;"

# Backup verification
pg_restore --list /backups/latest.dump
```

### Redis Maintenance
```bash
# Memory optimization
docker exec audio-tai-loc-redis redis-cli MEMORY DOCTOR

# Persistence check
docker exec audio-tai-loc-redis redis-cli LASTSAVE

# Configuration backup
docker exec audio-tai-loc-redis redis-cli CONFIG GET "*" > redis-config-backup.txt
```

### Certificate Renewal
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/audiotailoc.com/cert.pem -noout -enddate

# Renew certificate
certbot renew --nginx

# Verify renewal
nginx -t && systemctl reload nginx
```

### Log Rotation
```bash
# Configured in /etc/logrotate.d/audio-tai-loc
/var/log/audio-tai-loc/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker exec audio-tai-loc-app pm2 reloadLogs
    endscript
}
```

## Emergency Contacts

### Escalation Matrix
| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|--------------|
| Lead DevOps | John Doe | +84-xxx-xxx-xxx | john@audiotailoc.com | 24/7 |
| Backend Lead | Jane Smith | +84-xxx-xxx-xxx | jane@audiotailoc.com | Business hours |
| Database Admin | Bob Wilson | +84-xxx-xxx-xxx | bob@audiotailoc.com | On-call |
| Security Lead | Alice Brown | +84-xxx-xxx-xxx | alice@audiotailoc.com | Business hours |

### External Vendors
| Service | Support Email | Phone | Account # |
|---------|--------------|-------|-----------|
| Aiven (Database) | support@aiven.io | +1-xxx-xxx-xxxx | ATL-12345 |
| Cloudinary | support@cloudinary.com | +1-xxx-xxx-xxxx | ATL-67890 |
| PayOS | support@payos.vn | +84-xxx-xxx-xxx | ATL-PAY-123 |

### Important URLs
- **Production API**: https://api.audiotailoc.com
- **Staging API**: https://staging-api.audiotailoc.com
- **Status Page**: https://status.audiotailoc.com
- **Admin Dashboard**: https://admin.audiotailoc.com
- **Monitoring**: https://grafana.audiotailoc.com
- **Logs**: https://kibana.audiotailoc.com

## Appendix

### Common Commands Cheatsheet
```bash
# Service management
docker-compose ps
docker-compose logs -f app
pm2 status
pm2 logs

# Database queries
docker exec -it audio-tai-loc-db psql -U postgres -d audio_tai_loc_prod

# Redis commands
docker exec -it audio-tai-loc-redis redis-cli

# NGINX management
nginx -t
systemctl status nginx
systemctl reload nginx

# System resources
htop
df -h
free -m
iostat -x 1
```

### Backup Procedures
```bash
# Full backup script location
/opt/scripts/backup-production.sh

# Manual backup
pg_dump -h localhost -U postgres audio_tai_loc_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup to S3
aws s3 cp backup_*.sql s3://audio-tai-loc-backups/postgres/
```

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Approved By**: CTO
**Review Date**: January 2025
