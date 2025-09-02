# MedPort Server Management Scripts

This directory contains scripts to manage the MedPort development servers with automatic health monitoring and restart capabilities.

## 🚀 Quick Start

```bash
# Check server status
./scripts/server-manager.sh status

# Start servers
./scripts/server-manager.sh start

# Restart servers
./scripts/server-manager.sh restart

# Start health monitoring (checks every 30 seconds)
./scripts/server-manager.sh monitor
```

## 📋 Available Scripts

### `server-manager.sh` - Main Server Management
Quick commands for server management:

```bash
./scripts/server-manager.sh start     # Start both servers
./scripts/server-manager.sh stop      # Stop both servers  
./scripts/server-manager.sh restart   # Restart both servers
./scripts/server-manager.sh status    # Show server status
./scripts/server-manager.sh backend   # Restart backend only
./scripts/server-manager.sh frontend  # Restart frontend only
./scripts/server-manager.sh monitor   # Start health monitoring
```

### `health-monitor.sh` - Automatic Health Monitoring
Continuous health monitoring with automatic restart:

```bash
./scripts/health-monitor.sh           # Start monitoring
./scripts/health-monitor.sh status    # Show current status
./scripts/health-monitor.sh restart   # Manual restart
./scripts/health-monitor.sh stop      # Stop all services
```

### `start-dev-complete.sh` - Simple Server Start
Basic script to start both servers:

```bash
./scripts/start-dev-complete.sh
```

## 🔧 Server Configuration

- **Backend**: Port 5001 (Node.js/Express with TypeScript)
- **Frontend**: Port 3002 (React/Vite)
- **Health Check Interval**: 30 seconds
- **Log Files**: `backend.log`, `frontend.log`, `health-monitor.log`

## 🏥 Health Monitoring Features

The health monitor automatically:

- ✅ Checks server health every 30 seconds
- 🔄 Restarts unhealthy services automatically
- 📊 Logs all health checks and restarts
- 🎯 Monitors both backend and frontend
- 🛑 Graceful shutdown on Ctrl+C

## 🚨 Troubleshooting

### Servers Not Starting
```bash
# Check if ports are in use
lsof -i:5001
lsof -i:3002

# Kill processes on ports
./scripts/server-manager.sh stop

# Start fresh
./scripts/server-manager.sh start
```

### Login Issues
```bash
# Test backend authentication
curl -X POST http://localhost:5001/api/siloed-auth/hospital-login \
  -H "Content-Type: application/json" \
  -d '{"email":"hospital@medport.com","password":"password123"}'

# Test navigation API
curl -X GET http://localhost:5001/api/simple-navigation/navigation \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Issues
```bash
# Check frontend logs
tail -f frontend.log

# Restart frontend only
./scripts/server-manager.sh frontend
```

## 📊 Test Credentials

```
Hospital Login: hospital@medport.com / password123
Center Login:   center@medport.com / password123  
EMS Login:      agency@medport.com / password123
```

## 🔄 Development Workflow

1. **Start Development**:
   ```bash
   ./scripts/server-manager.sh start
   ```

2. **Monitor Health** (in separate terminal):
   ```bash
   ./scripts/server-manager.sh monitor
   ```

3. **Check Status**:
   ```bash
   ./scripts/server-manager.sh status
   ```

4. **Restart After Code Changes**:
   ```bash
   ./scripts/server-manager.sh restart
   ```

## 📝 Log Files

- `backend.log` - Backend server logs
- `frontend.log` - Frontend server logs  
- `health-monitor.log` - Health monitoring logs

## 🎯 Benefits

- **Automatic Recovery**: Servers restart automatically if they crash
- **Health Monitoring**: Continuous monitoring with detailed logging
- **Easy Management**: Simple commands for all server operations
- **Development Friendly**: Designed for active development workflow
- **Robust**: Handles port conflicts and process cleanup

This system ensures your MedPort development environment stays healthy and responsive, even during active development with frequent code changes.
