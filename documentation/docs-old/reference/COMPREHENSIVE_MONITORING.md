# TCC Comprehensive Monitoring System

## Overview

The TCC Comprehensive Monitoring System provides real-time monitoring of:
- **Backend Health** (port 5001)
- **Frontend Health** (port 3000)
- **Database Connections** (PostgreSQL + all TCC databases)
- **Environment File Changes** (hash-based detection)
- **System Resources** (disk space, memory usage)

## Features

### 🔍 **Environment File Monitoring**
- **Hash-based change detection** for accuracy
- **Priority-based warnings**:
  - 🚨 **CRITICAL**: `backend/.env` changes
  - ⚠️ **WARNING**: Production environment files
  - ℹ️ **INFO**: Local development files
- **30-second monitoring intervals**
- **Automatic hash file management**

### 🏥 **Health Checks**
- **Backend**: HTTP health endpoint monitoring
- **Frontend**: HTTP availability checking
- **Database**: PostgreSQL + TCC database connectivity
- **System**: Disk space and memory usage monitoring

### 📊 **Logging & Alerts**
- **Color-coded console output** for easy reading
- **Comprehensive log file** with timestamps
- **Real-time change notifications**
- **System resource warnings**

## Quick Start

### 1. Start Monitoring
```bash
# Start the comprehensive monitor
./scripts/start-monitor.sh start

# Check status
./scripts/start-monitor.sh status

# View logs
./scripts/start-monitor.sh logs
```

### 2. Monitor Environment Files
The system automatically monitors these files:
- `backend/.env` (CRITICAL)
- `frontend/.env.production` (WARNING)
- `frontend/.env.local` (INFO)
- `frontend/.env.production.local` (WARNING)
- `.vercel/.env.preview.local` (INFO)

### 3. Stop Monitoring
```bash
# Stop the monitor
./scripts/start-monitor.sh stop

# Restart the monitor
./scripts/start-monitor.sh restart
```

## Configuration

### Environment Files Priority
```bash
# Critical files (affects production)
backend/.env

# Warning files (affects deployment)
frontend/.env.production
frontend/.env.production.local

# Info files (development only)
frontend/.env.local
.vercel/.env.preview.local
```

### Monitoring Intervals
- **Health checks**: Every 30 seconds
- **Environment files**: Every 30 seconds
- **System resources**: Every 30 seconds

## File Structure

```
scripts/
├── tcc-comprehensive-monitor.sh  # Main monitoring script
├── start-monitor.sh              # Control script
└── ...

.env-hashes.txt                   # Hash storage file
tcc-monitor.log                   # Monitor log file
tcc-monitor.pid                   # Process ID file
```

## Log Format

### Console Output
```
🚀 Starting TCC Comprehensive Monitor
   Monitoring interval: 30 seconds
   Log file: tcc-monitor.log
   Hash file: .env-hashes.txt

📊 Calculating initial environment file hashes...
✅ backend/.env: a1b2c3d4e5f6...
✅ frontend/.env.production: f6e5d4c3b2a1...

🕐 [2025-01-25 10:30:00] Monitoring cycle started
----------------------------------------
🔍 Checking backend health...
✅ Backend is healthy (port 5001)
🔍 Checking frontend health...
✅ Frontend is healthy (port 3000)
🔍 Checking database connections...
✅ PostgreSQL is running
✅ Database tcc_center is accessible
✅ Database tcc_hospital is accessible
✅ Database tcc_ems is accessible
🔍 Checking system resources...
✅ Disk usage is normal: 45%
✅ Memory usage is normal: 25%
🔍 Checking environment files...
✅ All environment files unchanged
----------------------------------------
✅ All systems healthy
⏰ Next check in 30 seconds...
```

### Log File Format
```
[2025-01-25 10:30:00] CRITICAL: backend/.env changed (hash: a1b2c3d4e5f6...)
[2025-01-25 10:30:00] WARNING: frontend/.env.production changed (hash: f6e5d4c3b2a1...)
[2025-01-25 10:30:00] ERROR: Backend health check failed
[2025-01-25 10:30:00] WARNING: Disk usage is 95%
```

## Integration with Existing Scripts

### Backup Integration
The monitor can trigger automatic backups when critical environment files change:

```bash
# In tcc-comprehensive-monitor.sh
if [ "$priority" = "CRITICAL" ]; then
    echo -e "${RED}🚨 CRITICAL: Environment file changed: $file_path${NC}"
    echo -e "${RED}   This could affect production deployment!${NC}"
    
    # Trigger backup
    ./backup-enhanced.sh
fi
```

### iCloud Sync Integration
```bash
# Sync changed environment files to iCloud
if [ "$changes_detected" = true ]; then
    ./scripts/backup-critical-scripts-to-icloud.sh
fi
```

## Troubleshooting

### Common Issues

1. **Monitor won't start**
   ```bash
   # Check if already running
   ./scripts/start-monitor.sh status
   
   # Check logs
   ./scripts/start-monitor.sh logs
   ```

2. **Environment file changes not detected**
   ```bash
   # Check hash file
   cat .env-hashes.txt
   
   # Manually recalculate hashes
   md5sum backend/.env
   ```

3. **Health checks failing**
   ```bash
   # Check if services are running
   curl http://localhost:5001/health
   curl http://localhost:3000
   
   # Check database connections
   psql -h localhost -U scooper -d tcc_center -c "SELECT 1;"
   ```

### Manual Hash Reset
```bash
# Reset all hashes (will detect all files as changed)
rm .env-hashes.txt
./scripts/start-monitor.sh restart
```

## Advanced Usage

### Custom Monitoring Intervals
Edit `scripts/tcc-comprehensive-monitor.sh`:
```bash
MONITOR_INTERVAL=60  # Change to 60 seconds
```

### Add More Environment Files
Edit the `ENV_FILES` array:
```bash
ENV_FILES["custom/.env"]="WARNING"
```

### Custom Health Checks
Add new health check functions:
```bash
check_custom_service() {
    # Your custom health check logic
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Custom service is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Custom service is unhealthy${NC}"
        return 1
    fi
}
```

## Security Considerations

- **Hash files** contain file fingerprints (not sensitive data)
- **Log files** may contain file paths and timestamps
- **No sensitive environment data** is logged
- **Process ID files** are used for process management

## Performance Impact

- **Minimal CPU usage** (hash calculation every 30 seconds)
- **Low memory footprint** (single bash process)
- **Efficient file monitoring** (hash-based, not file watching)
- **Non-blocking health checks** (curl timeouts)

## Maintenance

### Regular Tasks
1. **Monitor log file size** (rotate if needed)
2. **Check hash file accuracy** (verify file changes are detected)
3. **Update environment file list** (add new files as needed)
4. **Review health check endpoints** (ensure they're working)

### Log Rotation
```bash
# Rotate log file when it gets large
if [ -f "tcc-monitor.log" ] && [ $(stat -f%z "tcc-monitor.log") -gt 10485760 ]; then
    mv tcc-monitor.log tcc-monitor.log.old
    touch tcc-monitor.log
fi
```

This comprehensive monitoring system provides early warning capabilities for environment file changes while maintaining system health monitoring, ensuring your TCC project remains stable and properly configured.
