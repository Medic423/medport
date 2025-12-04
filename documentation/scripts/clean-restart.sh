#!/bin/bash
# Clean restart script for TCC Backend
# Usage: ./scripts/clean-restart.sh

echo "🧹 TCC Backend Clean Restart Script"
echo "=================================="

# Kill existing processes
echo "🔄 Stopping existing processes..."

# Kill nodemon processes
if pgrep -f nodemon > /dev/null; then
    echo "  - Killing nodemon processes..."
    pkill -f nodemon
    sleep 1
fi

# Kill ts-node processes
if pgrep -f "ts-node src/index.ts" > /dev/null; then
    echo "  - Killing ts-node processes..."
    pkill -f "ts-node src/index.ts"
    sleep 1
fi

# Kill any process using port 5001
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "  - Killing processes on port 5001..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Verify cleanup
REMAINING_PROCESSES=$(ps aux | grep -E "(nodemon|ts-node)" | grep -v grep | wc -l)
if [ $REMAINING_PROCESSES -gt 0 ]; then
    echo "⚠️  Warning: $REMAINING_PROCESSES processes still running"
    echo "  - Manual cleanup may be required"
else
    echo "✅ All processes cleaned up successfully"
fi

# Wait for port to be released
echo "⏳ Waiting for port 5001 to be released..."
for i in {1..10}; do
    if ! lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Port 5001 is now available"
        break
    fi
    echo "  - Attempt $i/10: Port still in use, waiting..."
    sleep 1
done

# Check if port is still in use
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 5001 is still in use after cleanup"
    echo "  - You may need to restart your terminal or machine"
    exit 1
fi

# Start the server
echo "🚀 Starting TCC Backend server..."
cd /Users/scooper/Code/tcc-new-project/backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "  - Starting with: npm run dev"
npm run dev
