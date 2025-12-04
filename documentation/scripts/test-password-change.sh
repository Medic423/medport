#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/test-password-change.sh EMAIL OLD_PASS NEW_PASS
# Requires backend running at http://localhost:5001

BASE_URL="http://localhost:5001"
EMAIL=${1:-}
OLD_PASS=${2:-}
NEW_PASS=${3:-}

if [[ -z "$EMAIL" || -z "$OLD_PASS" || -z "$NEW_PASS" ]]; then
  echo "Usage: $0 EMAIL OLD_PASS NEW_PASS"
  exit 1
fi

echo "[1/4] Logging in with old password..."
LOGIN_JSON=$(curl -s -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$OLD_PASS\"}")
TOKEN=$(echo "$LOGIN_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).token || ''" 2>/dev/null || true)
if [[ -z "$TOKEN" ]]; then
  echo "Login failed with old password. Response: $LOGIN_JSON"
  exit 1
fi
echo "OK"

echo "[2/4] Attempting password change..."
CHANGE_JSON=$(curl -s -X PUT "$BASE_URL/api/auth/password/change" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"currentPassword\":\"$OLD_PASS\",\"newPassword\":\"$NEW_PASS\"}")
SUCCESS=$(echo "$CHANGE_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).success ? 'yes' : 'no'" 2>/dev/null || echo no)
if [[ "$SUCCESS" != "yes" ]]; then
  echo "Password change failed. Response: $CHANGE_JSON"
  exit 1
fi
echo "OK"

echo "[3/4] Verifying login with new password..."
LOGIN_NEW_JSON=$(curl -s -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$NEW_PASS\"}")
NEW_TOKEN=$(echo "$LOGIN_NEW_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).token || ''" 2>/dev/null || true)
if [[ -z "$NEW_TOKEN" ]]; then
  echo "Login failed with new password. Response: $LOGIN_NEW_JSON"
  exit 1
fi
echo "OK"

echo "[4/4] Reverting to original password..."
REVERT_JSON=$(curl -s -X PUT "$BASE_URL/api/auth/password/change" \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"currentPassword\":\"$NEW_PASS\",\"newPassword\":\"$OLD_PASS\"}")
SUCCESS_REVERT=$(echo "$REVERT_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).success ? 'yes' : 'no'" 2>/dev/null || echo no)
if [[ "$SUCCESS_REVERT" != "yes" ]]; then
  echo "Revert failed. Response: $REVERT_JSON"
  exit 1
fi
echo "OK"

echo "All steps passed."


