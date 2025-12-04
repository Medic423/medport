#!/usr/bin/env bash
set -euo pipefail

# Runs both the enhanced backup to external drive and copies critical scripts to iCloud
# Usage: scripts/backup-run-all.sh [DESTINATION_DIR]
# Default DESTINATION_DIR: /Volumes/Acasis/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST_ROOT="${1:-/Volumes/Acasis/}"

echo "🔁 Running all backups..."
echo "Destination root: ${DEST_ROOT}"

chmod +x "${PROJECT_ROOT}/scripts/backup-enhanced-latest.sh" || true
chmod +x "${PROJECT_ROOT}/scripts/backup-critical-scripts-to-icloud.sh" || true

"${PROJECT_ROOT}/scripts/backup-enhanced-latest.sh" "${DEST_ROOT}"
"${PROJECT_ROOT}/scripts/backup-critical-scripts-to-icloud.sh"

echo "✅ All backups completed."


