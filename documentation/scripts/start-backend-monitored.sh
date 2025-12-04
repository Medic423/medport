#!/bin/bash

# TCC Backend Startup and Health Monitoring Script
# This script starts the backend and monitors its health every minute

set -e

# Configuration
BACKEND_DIR="/Users/scooper/Code/tcc-new-project/backend"
HEALTH_URL="http://localhost:5001/health"
LOG_FILE="/Users/scooper/Code/tcc-new-project/backend-health.log"
PID_FILE="/Users/scooper/Code/tcc-new-project/backend.pid"
MAX_RESTART_ATTEMPTS=3
RESTART_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if backend is running
check_backend_health() {
    local response
    response=$(curl -s -w "%{http_code}" -o /dev/null "$HEALTH_URL" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Function to get backend status details
get_backend_status() {
    local response
    response=$(curl -s "$HEALTH_URL" 2>/dev/null || echo '{"status":"unreachable"}')
    echo "$response"
}

# Function to start backend
start_backend() {
    log "Starting TCC Backend..."
    
    # Kill any existing backend processes
    pkill -f "node dist/index.js" 2>/dev/null || true
    sleep 2
    
    # Change to backend directory and start
    cd "$BACKEND_DIR" || {
        error "Failed to change to backend directory: $BACKEND_DIR"
        exit 1
    }
    
    # Start backend in background
    nohup npm start > /dev/null 2>&1 &
    local backend_pid=$!
    echo "$backend_pid" > "$PID_FILE"
    
    log "Backend started with PID: $backend_pid"
    
    # Wait for backend to start
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if check_backend_health; then
            success "Backend is healthy and responding"
            return 0
        fi
        
        attempts=$((attempts + 1))
        log "Waiting for backend to start... (attempt $attempts/$max_attempts)"
        sleep 2
    done
    
    error "Backend failed to start within expected time"
    return 1
}

# Function to restart backend
restart_backend() {
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $RESTART_COUNT -gt $MAX_RESTART_ATTEMPTS ]; then
        error "Maximum restart attempts ($MAX_RESTART_ATTEMPTS) reached. Stopping monitoring."
        exit 1
    fi
    
    warning "Restarting backend (attempt $RESTART_COUNT/$MAX_RESTART_ATTEMPTS)"
    
    # Kill existing process
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        kill "$pid" 2>/dev/null || true
        rm -f "$PID_FILE"
    fi
    
    sleep 3
    start_backend
}

# Function to monitor backend health
monitor_backend() {
    log "Starting backend health monitoring..."
    log "Health check URL: $HEALTH_URL"
    log "Log file: $LOG_FILE"
    log "PID file: $PID_FILE"
    
    while true; do
        if check_backend_health; then
            # Backend is healthy
            local status=$(get_backend_status)
            log "Backend health check: OK - $status"
            RESTART_COUNT=0  # Reset restart counter on successful health check
        else
            error "Backend health check failed"
            restart_backend
        fi
        
        # Wait 60 seconds before next check
        sleep 60
    done
}

# Function to cleanup on exit
cleanup() {
    log "Shutting down backend monitoring..."
    
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        log "Stopping backend process (PID: $pid)"
        kill "$pid" 2>/dev/null || true
        rm -f "$PID_FILE"
    fi
    
    # Kill any remaining node processes
    pkill -f "node dist/index.js" 2>/dev/null || true
    
    log "Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log "=== TCC Backend Startup and Monitoring Script ==="
    log "Starting at $(date)"
    
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    
    # Start backend
    if start_backend; then
        success "Backend startup successful"
        monitor_backend
    else
        error "Backend startup failed"
        exit 1
    fi
}

# Run main function
main "$@"
