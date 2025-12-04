#!/usr/bin/env bash
set -euo pipefail

# Usage examples:
#  Healthcare:
#    ./scripts/test-subusers.sh healthcare parent_email parent_password sub_email "Sub Name" Newpass123
#  EMS:
#    ./scripts/test-subusers.sh ems parent_email parent_password sub_email "Sub Name" Newpass123

ROLE=${1:-}
PARENT_EMAIL=${2:-}
PARENT_PASS=${3:-}
SUB_EMAIL=${4:-}
SUB_NAME=${5:-}
SUB_NEW_PASS=${6:-}

BASE_URL="http://localhost:5001"

if [[ -z "$ROLE" || -z "$PARENT_EMAIL" || -z "$PARENT_PASS" || -z "$SUB_EMAIL" || -z "$SUB_NAME" || -z "$SUB_NEW_PASS" ]]; then
  echo "Usage: $0 <healthcare|ems> PARENT_EMAIL PARENT_PASS SUB_EMAIL SUB_NAME SUB_NEW_PASS"; exit 1; fi

echo "[1/6] Parent login..."
LOGIN_JSON=$(curl -s -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$PARENT_EMAIL\",\"password\":\"$PARENT_PASS\"}") || true
TOKEN=$(echo "$LOGIN_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).token || ''" 2>/dev/null || true)
if [[ -z "$TOKEN" ]]; then echo "Parent login failed: $LOGIN_JSON"; exit 1; fi
echo "OK"

ENDPOINT_PREFIX="/api/healthcare/sub-users"
[[ "$ROLE" == "ems" ]] && ENDPOINT_PREFIX="/api/ems/sub-users"

echo "[2/6] Create sub-user..."
CREATE_JSON=$(curl -s -X POST "$BASE_URL$ENDPOINT_PREFIX" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "{\"email\":\"$SUB_EMAIL\",\"name\":\"$SUB_NAME\"}")
TEMP_PASS=$(echo "$CREATE_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).data?.tempPassword || ''" 2>/dev/null || true)
if [[ -z "$TEMP_PASS" ]]; then echo "Create failed: $CREATE_JSON"; exit 1; fi
echo "Temp password: $TEMP_PASS"

echo "[3/6] Sub-user login (should require change)..."
LOGIN_SUB_JSON=$(curl -s -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$SUB_EMAIL\",\"password\":\"$TEMP_PASS\"}")
MUST_CHANGE=$(echo "$LOGIN_SUB_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).mustChangePassword ? 'yes' : 'no'" 2>/dev/null || echo no)
SUB_TOKEN=$(echo "$LOGIN_SUB_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).token || ''" 2>/dev/null || true)
if [[ "$MUST_CHANGE" != "yes" ]]; then echo "Expected mustChangePassword=true: $LOGIN_SUB_JSON"; exit 1; fi
echo "OK"

echo "[4/6] Change password..."
CHANGE_JSON=$(curl -s -X PUT "$BASE_URL/api/auth/password/change" -H "Authorization: Bearer $SUB_TOKEN" -H 'Content-Type: application/json' -d "{\"currentPassword\":\"$TEMP_PASS\",\"newPassword\":\"$SUB_NEW_PASS\"}")
if [[ $(echo "$CHANGE_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).success ? 'yes' : 'no'" 2>/dev/null || echo no) != "yes" ]]; then echo "Change failed: $CHANGE_JSON"; exit 1; fi
echo "OK"

echo "[5/6] Verify login with new password..."
LOGIN_NEW_JSON=$(curl -s -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$SUB_EMAIL\",\"password\":\"$SUB_NEW_PASS\"}")
if [[ $(echo "$LOGIN_NEW_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).success ? 'yes' : 'no'" 2>/dev/null || echo no) != "yes" ]]; then echo "New login failed: $LOGIN_NEW_JSON"; exit 1; fi
if [[ $(echo "$LOGIN_NEW_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).mustChangePassword ? 'yes' : 'no'" 2>/dev/null || echo no) != "no" ]]; then echo "mustChangePassword still true unexpectedly: $LOGIN_NEW_JSON"; exit 1; fi
echo "OK"

echo "[6/6] Deactivate and reactivate..."
SUB_ID=$(echo "$LOGIN_NEW_JSON" | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).user?.id || ''" 2>/dev/null || true)
[[ -z "$SUB_ID" ]] && echo "Could not read sub-user id" && exit 1
DEACT_JSON=$(curl -s -X PATCH "$BASE_URL$ENDPOINT_PREFIX/$SUB_ID" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"isActive":false}')
ACT_JSON=$(curl -s -X PATCH "$BASE_URL$ENDPOINT_PREFIX/$SUB_ID" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"isActive":true}')
echo "OK"

echo "All sub-user tests passed."


