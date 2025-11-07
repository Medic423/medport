#!/usr/bin/env bash
set -euo pipefail

# Copies critical backup scripts to iCloud Drive for resilience

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Default iCloud Drive location on macOS
ICLOUD_DRIVE="${HOME}/Library/Mobile Documents/com~apple~CloudDocs/TCC-Critical-Scripts"

mkdir -p "${ICLOUD_DRIVE}"

echo "☁️  Backing up critical scripts to iCloud: ${ICLOUD_DRIVE}"

cp -f "${PROJECT_ROOT}/scripts/backup-enhanced-latest.sh" "${ICLOUD_DRIVE}/" || true
cp -f "${PROJECT_ROOT}/scripts/backup-critical-scripts-to-icloud.sh" "${ICLOUD_DRIVE}/" || true
cp -f "${PROJECT_ROOT}/backup-enhanced.sh" "${ICLOUD_DRIVE}/" || true

echo "✅ Critical scripts updated in iCloud"


