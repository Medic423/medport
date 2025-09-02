#!/bin/bash

# MedPort Health Monitor
# Checks server health every 30 seconds and restarts if necessary
# Similar to ChartCoach health monitoring system

BACKEND_URL="http://localhost:5001/health"
FRONTEND_URL="http://localhost:3002"
BACKEND_PORT=5001
FRONTEND_PORT=3002
CHECK_INTERVAL=30
LOG_FILE="health-monitor.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if a service is responding
check_service() {
    local url=$1
    local name=$2
    local port=$3
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not responding on port $port${NC}"
        return 1
    fi
}

# Get process ID for a port
get_pid_for_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null || echo ""
}

# Kill processes on specific ports
kill_port_processes() {
    local port=$1
    local name=$2
    
    local pids=$(get_pid_for_port $port)
    if [ ! -z "$pids" ]; then
        log "Killing $name processes on port $port: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Start backend server
start_backend() {
    log "Starting backend server on port $BACKEND_PORT..."
    cd backend
    PORT=$BACKEND_PORT npm run dev > ../backend.log 2>&1 &
    cd ..
    sleep 5
}

# Start frontend server
start_frontend() {
    log "Starting frontend server on port $FRONTEND_PORT..."
    cd frontend
    PORT=$FRONTEND_PORT npm run dev > ../frontend.log 2>&1 &
    cd ..
    sleep 5
}

# Restart a service
restart_service() {
    local service=$1
    local port=$2
    
    log "Restarting $service..."
    kill_port_processes $port $service
    
    if [ "$service" = "backend" ]; then
        start_backend
    elif [ "$service" = "frontend" ]; then
        start_frontend
    fi
    
    log "$service restart completed"
}

# Main health check function
health_check() {
    log "=== Health Check Started ==="
    
    local backend_healthy=true
    local frontend_healthy=true
    
    # Check backend
    if ! check_service "$BACKEND_URL" "Backend" "$BACKEND_PORT"; then
        backend_healthy=false
    fi
    
    # Check frontend
    if ! check_service "$FRONTEND_URL" "Frontend" "$FRONTEND_PORT"; then
        frontend_healthy=false
    fi
    
    # Restart unhealthy services
    if [ "$backend_healthy" = false ]; then
        restart_service "backend" "$BACKEND_PORT"
    fi
    
    if [ "$frontend_healthy" = false ]; then
        restart_service "frontend" "$FRONTEND_PORT"
    fi
    
    # Final status
    if [ "$backend_healthy" = true ] && [ "$frontend_healthy" = true ]; then
        echo -e "${GREEN}🎉 All services are healthy!${NC}"
        log "All services are healthy"
    else
        echo -e "${YELLOW}⚠️  Some services were restarted${NC}"
        log "Some services were restarted"
    fi
    
    log "=== Health Check Completed ==="
    echo ""
}

# Show current status
show_status() {
    echo -e "${BLUE}📊 MedPort Server Status${NC}"
    echo "================================"
    
    # Backend status
    if check_service "$BACKEND_URL" "Backend" "$BACKEND_PORT"; then
        local backend_pid=$(get_pid_for_port $BACKEND_PORT)
        echo -e "Backend PID: ${GREEN}$backend_pid${NC}"
    else
        echo -e "Backend: ${RED}Not Running${NC}"
    fi
    
    # Frontend status
    if check_service "$FRONTEND_URL" "Frontend" "$FRONTEND_PORT"; then
        local frontend_pid=$(get_pid_for_port $FRONTEND_PORT)
        echo -e "Frontend PID: ${GREEN}$frontend_pid${NC}"
    else
        echo -e "Frontend: ${RED}Not Running${NC}"
    fi
    
    echo "================================"
    echo ""
}

# Cleanup function
cleanup() {
    log "Health monitor stopped by user"
    echo -e "${YELLOW}Health monitor stopped${NC}"
    exit 0
}

# Main function
main() {
    echo -e "${BLUE}🏥 MedPort Health Monitor${NC}"
    echo "================================"
    echo "Monitoring servers every $CHECK_INTERVAL seconds"
    echo "Backend: $BACKEND_URL"
    echo "Frontend: $FRONTEND_URL"
    echo "Log file: $LOG_FILE"
    echo "Press Ctrl+C to stop"
    echo "================================"
    echo ""
    
    # Set up signal handlers
    trap cleanup INT TERM
    
    # Initial status check
    show_status
    
    # Main monitoring loop
    while true; do
        health_check
        sleep $CHECK_INTERVAL
    done
}

# Handle command line arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "restart")
        echo -e "${YELLOW}Restarting all services...${NC}"
        kill_port_processes $BACKEND_PORT "backend"
        kill_port_processes $FRONTEND_PORT "frontend"
        start_backend
        start_frontend
        echo -e "${GREEN}All services restarted${NC}"
        ;;
    "stop")
        echo -e "${YELLOW}Stopping all services...${NC}"
        kill_port_processes $BACKEND_PORT "backend"
        kill_port_processes $FRONTEND_PORT "frontend"
        echo -e "${GREEN}All services stopped${NC}"
        ;;
    *)
        main
        ;;
esac
