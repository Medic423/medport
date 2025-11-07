#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL=${BACKEND_URL:-http://localhost:5001}
AUTH_EMAIL=${AUTH_EMAIL:-admin@tcc.com}
AUTH_PASS=${AUTH_PASS:-admin123}

jq --version >/dev/null 2>&1 || { echo "jq required"; exit 1; }

login() {
  curl -sS -H 'Content-Type: application/json' -d "{\"email\":\"$AUTH_EMAIL\",\"password\":\"$AUTH_PASS\"}" "$BACKEND_URL/api/auth/login" | jq -r .token
}

auth_header() {
  echo "Authorization: Bearer $TOKEN"
}

seed_breakdown() {
  local TRIP_ID=$1; shift
  local CALC_AT=$1; shift
  curl -sS -H "$(auth_header)" -H 'Content-Type: application/json' \
    -d "$(jq -n --arg tripId "$TRIP_ID" --arg calc "$CALC_AT" '{tripId:$tripId, breakdownData:{ baseRevenue:200, mileageRevenue:120, priorityRevenue:30, insuranceAdjustment:0, totalRevenue:350, crewLaborCost:100, vehicleCost:40, fuelCost:20, maintenanceCost:10, overheadCost:15, totalCost:185, grossProfit:165, profitMargin:47.1, revenuePerMile:10, costPerMile:5, loadedMileRatio:0.8, deadheadMileRatio:0.2, utilizationRate:0.85, tripDistance:20, loadedMiles:16, deadheadMiles:4, tripDurationHours:2, transportLevel:"ALS", priorityLevel:"MEDIUM", calculatedAt:$calc }}')" \
    "$BACKEND_URL/api/tcc/analytics/cost-breakdown" | jq -r .success
}

get_cost_analysis() {
  local START=$1; local END=$2
  curl -sS -H "$(auth_header)" "$BACKEND_URL/api/tcc/analytics/cost-analysis?startDate=$START&endDate=$END"
}

get_profitability() {
  local PERIOD=$1
  curl -sS -H "$(auth_header)" "$BACKEND_URL/api/tcc/analytics/profitability?period=$PERIOD"
}

main() {
  echo "🔐 Logging in..." >&2
  TOKEN=$(login)
  test -n "$TOKEN"
  echo "🔑 Token acquired"

  # Generate two synthetic trips ids (uuid-like)
  TRIP_WITHIN_WEEK="trip-week-$(date +%s)"
  TRIP_OLDER_THAN_WEEK="trip-month-$(date +%s)"

  # Seed cost breakdowns: one 2 days ago (within week), one 20 days ago (outside week but within month)
  NOW_UTC=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
  TWO_DAYS_AGO=$(date -u -v-2d +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -u -d "2 days ago" +%Y-%m-%dT%H:%M:%S.000Z)
  TWENTY_DAYS_AGO=$(date -u -v-20d +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -u -d "20 days ago" +%Y-%m-%dT%H:%M:%S.000Z)

  START_MONTH=$(date -u +%Y-%m-01)T00:00:00.000Z

  echo "🌱 Seeding within-week breakdown (2 days ago)..."
  seed_breakdown "$TRIP_WITHIN_WEEK" "$TWO_DAYS_AGO" >/dev/null || true

  echo "🌱 Seeding month-only breakdown (20 days ago)..."
  seed_breakdown "$TRIP_OLDER_THAN_WEEK" "$TWENTY_DAYS_AGO" >/dev/null || true

  echo "📈 Fetching cost analysis for current month..."
  CURR=$(get_cost_analysis "$START_MONTH" "$(date -u +%Y-%m-%d)T23:59:59.000Z")
  echo "$CURR" | jq .

  echo "📉 Fetching profitability for month..."
  PROF_MONTH=$(get_profitability month)
  echo "$PROF_MONTH" | jq .

  echo "📅 Fetching profitability for week..."
  PROF_WEEK=$(get_profitability week)
  echo "$PROF_WEEK" | jq .

  # Simple assertions: totals should differ between month and week when data exists
  CURR_REVENUE=$(echo "$PROF_MONTH" | jq -r .data.totalRevenue)
  WEEK_REVENUE=$(echo "$PROF_WEEK" | jq -r .data.totalRevenue)
  echo "Month revenue: $CURR_REVENUE | Week revenue: $WEEK_REVENUE"

  if [ "$CURR_REVENUE" != "null" ] && [ "$WEEK_REVENUE" != "null" ] && [ "$CURR_REVENUE" != "$WEEK_REVENUE" ]; then
    echo "✅ Profitability changes across periods as expected"
  else
    echo "⚠️ Profitability may not be changing across periods"
  fi
}

main "$@"
