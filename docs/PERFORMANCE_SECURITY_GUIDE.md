# Performance & Security Hardening Guide

## Performance Testing with k6

### Running Load Tests

1. **Install k6**:
   ```bash
   # macOS
   brew install k6
   
   # Linux
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Run the load test**:
   ```bash
   # Default (localhost:3002)
   ./k6-tests/run-load-test.sh
   
   # Custom URL
   BASE_URL=https://api.example.com ./k6-tests/run-load-test.sh
   ```

3. **Monitor results**:
   - p95 latency should be < 500ms
   - Error rate should be < 1%
   - Target: 1000 RPS sustained

### Database Performance Optimization

1. **Apply performance indexes**:
   ```bash
   # Run the index creation script
   psql $DATABASE_URL < prisma/migrations/add_performance_indexes.sql
   ```

2. **Monitor slow queries**:
   ```sql
   -- Enable query logging
   ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
   SELECT pg_reload_conf();
   
   -- View slow queries
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 20;
   ```

3. **Query optimization tips**:
   - Use `EXPLAIN ANALYZE` to understand query plans
   - Ensure indexes are being used
   - Avoid N+1 queries
   - Use pagination for large result sets

## Redis Caching Implementation

### Cache Strategy

1. **Cached Endpoints**:
   - Product listings: 5 minutes TTL
   - Product details: 10 minutes TTL
   - Featured products: 10 minutes TTL
   - Best sellers: 30 minutes TTL
   - Categories: 1 hour TTL

2. **Cache Invalidation**:
   ```typescript
   // Invalidate product cache on update
   await redisService.cacheInvalidate([
     'products:*',
     `product:${productId}:*`
   ]);
   ```

3. **Redis Configuration**:
   ```bash
   # .env
   REDIS_URL=redis://localhost:6379
   REDIS_TTL_DEFAULT=300
   REDIS_MAX_ITEMS=1000
   ```

## Security Hardening

### 1. Helmet Configuration

Helmet is configured in `main.ts` with:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

### 2. Rate Limiting

Configured via ThrottlerModule:
- Default: 100 requests per minute per IP
- Customizable per endpoint
- Redis-backed for distributed systems

### 3. Input Sanitization

All inputs are sanitized using:
- DOMPurify for HTML content
- SQL injection pattern detection
- Whitelist validation with class-validator

### 4. Error Handling

Centralized error handling prevents information leakage:
- Production: Generic error messages
- Development: Detailed stack traces
- All errors logged with context

## Security Scanning

### 1. Dependency Scanning

**Snyk Integration**:
```bash
# Local scan
npm install -g snyk
snyk auth
snyk test

# Fix vulnerabilities
snyk fix
```

**GitHub Actions**:
- Automated daily scans
- PR blocking on high severity
- SARIF report generation

### 2. OWASP ZAP Scanning

**Manual scan**:
```bash
# Start the application
npm run start:dev

# Run ZAP Docker
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3002 \
  -c .zap/rules.tsv
```

**Automated scan**:
- Runs on main branch pushes
- Baseline scan configuration
- HTML report generation

### 3. npm Audit

```bash
# Check for vulnerabilities
npm audit

# Auto-fix where possible
npm audit fix

# Force fixes (careful!)
npm audit fix --force
```

## Monitoring & Alerts

### 1. Application Performance Monitoring

Recommended tools:
- **New Relic**: Full APM solution
- **DataDog**: Infrastructure + APM
- **Elastic APM**: Open source option

### 2. Key Metrics to Monitor

- **Response Times**: p50, p95, p99
- **Error Rates**: 4xx, 5xx responses
- **Database**: Query times, connection pool
- **Redis**: Hit rate, memory usage
- **Node.js**: Memory, CPU, event loop lag

### 3. Alerting Thresholds

```yaml
alerts:
  - name: High Response Time
    condition: p95_latency > 1000ms for 5 minutes
    severity: warning
    
  - name: High Error Rate
    condition: error_rate > 5% for 3 minutes
    severity: critical
    
  - name: Database Slow Queries
    condition: query_time > 5s
    severity: warning
    
  - name: Redis Memory Usage
    condition: memory_usage > 80%
    severity: warning
```

## Production Checklist

- [ ] Environment variables properly set
- [ ] Database indexes applied
- [ ] Redis configured and connected
- [ ] Helmet security headers enabled
- [ ] Rate limiting configured
- [ ] Error handling in production mode
- [ ] Dependency vulnerabilities fixed
- [ ] HTTPS enforced
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Load testing passed (1k RPS, p95 < 500ms)
- [ ] Security scan passed

## Troubleshooting

### High Latency Issues

1. Check database query performance
2. Verify Redis cache hit rates
3. Look for N+1 queries
4. Check for memory leaks
5. Review application logs

### Security Vulnerabilities

1. Update dependencies regularly
2. Review Snyk/npm audit reports
3. Check OWASP ZAP findings
4. Review security headers
5. Audit authentication flows

### Load Testing Failures

1. Optimize slow endpoints
2. Add caching where appropriate
3. Scale database connections
4. Use connection pooling
5. Consider horizontal scaling
