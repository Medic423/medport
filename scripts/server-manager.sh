#!/bin/bash

# MedPort Server Manager
# Quick server management commands

BACKEND_PORT=5001
FRONTEND_PORT=3002
BACKEND_URL="http://localhost:5001/health"
FRONTEND_URL="http://localhost:3002"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kill processes on port
kill_port() {
    local port=$1
    local name=$2
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Killing $name processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo -e "${BLUE}No $name processes found on port $port${NC}"
    fi
}

# Start backend
start_backend() {
    echo -e "${BLUE}Starting backend on port $BACKEND_PORT...${NC}"
    cd backend
    PORT=$BACKEND_PORT npm run dev > ../backend.log 2>&1 &
    cd ..
    echo -e "${GREEN}Backend started${NC}"
}

# Start frontend
start_frontend() {
    echo -e "${BLUE}Starting frontend on port $FRONTEND_PORT...${NC}"
    cd frontend
    PORT=$FRONTEND_PORT npm run dev > ../frontend.log 2>&1 &
    cd ..
    echo -e "${GREEN}Frontend started${NC}"
}

# Check service health
check_health() {
    local url=$1
    local name=$2
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not responding${NC}"
        return 1
    fi
}

# Show status
status() {
    echo -e "${BLUE}📊 MedPort Server Status${NC}"
    echo "================================"
    
    # Backend
    if check_health "$BACKEND_URL" "Backend"; then
        local backend_pid=$(lsof -ti:$BACKEND_PORT 2>/dev/null)
        echo -e "Backend PID: ${GREEN}$backend_pid${NC}"
    fi
    
    # Frontend
    if check_health "$FRONTEND_URL" "Frontend"; then
        local frontend_pid=$(lsof -ti:$FRONTEND_PORT 2>/dev/null)
        echo -e "Frontend PID: ${GREEN}$frontend_pid${NC}"
    fi
    
    echo "================================"
}

# Main command handling
case "${1:-}" in
    "start")
        echo -e "${BLUE}🚀 Starting MedPort servers...${NC}"
        kill_port $BACKEND_PORT "backend"
        kill_port $FRONTEND_PORT "frontend"
        start_backend
        start_frontend
        sleep 3
        status
        ;;
    "stop")
        echo -e "${YELLOW}🛑 Stopping MedPort servers...${NC}"
        kill_port $BACKEND_PORT "backend"
        kill_port $FRONTEND_PORT "frontend"
        echo -e "${GREEN}All servers stopped${NC}"
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting MedPort servers...${NC}"
        kill_port $BACKEND_PORT "backend"
        kill_port $FRONTEND_PORT "frontend"
        start_backend
        start_frontend
        sleep 3
        status
        ;;
    "status")
        status
        ;;
    "backend")
        echo -e "${BLUE}🔄 Restarting backend only...${NC}"
        kill_port $BACKEND_PORT "backend"
        start_backend
        sleep 3
        check_health "$BACKEND_URL" "Backend"
        ;;
    "frontend")
        echo -e "${BLUE}🔄 Restarting frontend only...${NC}"
        kill_port $FRONTEND_PORT "frontend"
        start_frontend
        sleep 3
        check_health "$FRONTEND_URL" "Frontend"
        ;;
    "monitor")
        echo -e "${BLUE}🏥 Starting health monitor...${NC}"
        ./scripts/health-monitor.sh
        ;;
    *)
        echo -e "${BLUE}MedPort Server Manager${NC}"
        echo "================================"
        echo "Usage: $0 {start|stop|restart|status|backend|frontend|monitor}"
        echo ""
        echo "Commands:"
        echo "  start    - Start both servers"
        echo "  stop     - Stop both servers"
        echo "  restart  - Restart both servers"
        echo "  status   - Show server status"
        echo "  backend  - Restart backend only"
        echo "  frontend - Restart frontend only"
        echo "  monitor  - Start health monitoring"
        echo ""
        echo "Examples:"
        echo "  $0 start     # Start servers"
        echo "  $0 status    # Check status"
        echo "  $0 restart   # Restart servers"
        echo "  $0 monitor   # Start health monitor"
        ;;
esac
