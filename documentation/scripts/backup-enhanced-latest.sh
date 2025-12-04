#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/backup-enhanced-latest.sh [DESTINATION_DIR]
# Default DESTINATION_DIR: /Volumes/Acasis/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEST_ROOT="${1:-/Volumes/Acasis/}"

echo "🔄 Running enhanced latest backup..."
echo "Project: ${PROJECT_ROOT}"
echo "Destination root: ${DEST_ROOT}"

if [ ! -d "${DEST_ROOT}" ]; then
  echo "❌ Destination root not found: ${DEST_ROOT}" >&2
  exit 1
fi

chmod +x "${PROJECT_ROOT}/backup-enhanced.sh" || true

"${PROJECT_ROOT}/backup-enhanced.sh" "${DEST_ROOT}"

echo "✅ Enhanced latest backup completed."


