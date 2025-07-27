#!/bin/bash

# Audio Tài Lộc API Deployment Script
# This script handles production deployment with zero-downtime

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="audio-tai-loc-api"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Create database backup
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"; then
        success "Database backup created: $BACKUP_FILE"
    else
        warning "Failed to create database backup"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Load environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    # Build new images
    log "Building Docker images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" run --rm app npx prisma migrate deploy
    
    # Start services with zero-downtime deployment
    log "Deploying services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --remove-orphans
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Health check
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "Application is healthy"
    else
        error "Application health check failed"
    fi
    
    success "Deployment completed successfully"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Restore from backup if available
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.sql 2>/dev/null | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring database from backup: $LATEST_BACKUP"
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres
        sleep 10
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$LATEST_BACKUP"
    fi
    
    # Start previous version (this would need to be implemented based on your versioning strategy)
    warning "Manual intervention required to restore previous version"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 10)
    find "$BACKUP_DIR" -name "backup_*.sql" -type f | sort -r | tail -n +11 | xargs rm -f
    
    success "Cleanup completed"
}

# Monitor deployment
monitor() {
    log "Monitoring deployment..."
    
    # Check container status
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    # Show logs
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50 app
}

# Main deployment process
main() {
    log "Starting Audio Tài Lộc API deployment"
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            create_backup
            deploy
            cleanup
            monitor
            ;;
        "rollback")
            rollback
            ;;
        "backup")
            create_backup
            ;;
        "cleanup")
            cleanup
            ;;
        "monitor")
            monitor
            ;;
        "health")
            curl -f http://localhost:3001/health || error "Health check failed"
            success "Application is healthy"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|backup|cleanup|monitor|health}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Full deployment with backup and health checks"
            echo "  rollback - Rollback to previous version"
            echo "  backup   - Create database backup only"
            echo "  cleanup  - Clean up old images and backups"
            echo "  monitor  - Show container status and logs"
            echo "  health   - Check application health"
            exit 1
            ;;
    esac
}

# Create logs directory
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main "$@"
