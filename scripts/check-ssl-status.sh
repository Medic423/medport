#!/bin/bash

# SSL Certificate Status Monitor for api.traccems.com
# Checks SSL certificate provisioning status for backend custom domain

set -e

APP_NAME="TraccEms-Prod-Backend"
RESOURCE_GROUP="TraccEms-Prod-USCentral"
DOMAIN="api.traccems.com"
HEALTH_ENDPOINT="https://api.traccems.com/health"

echo "=========================================="
echo "SSL Certificate Status Monitor"
echo "Domain: $DOMAIN"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Check SSL state via Azure CLI
echo "Checking SSL certificate status via Azure CLI..."
SSL_STATE=$(az webapp config hostname list \
  --webapp-name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "[?name=='$DOMAIN'].sslState" \
  --output tsv 2>/dev/null || echo "null")

if [ -z "$SSL_STATE" ] || [ "$SSL_STATE" == "null" ]; then
  echo "❌ SSL State: null (still provisioning)"
  SSL_READY=false
else
  echo "✅ SSL State: $SSL_STATE"
  SSL_READY=true
fi

echo ""

# Check HTTPS accessibility
echo "Testing HTTPS endpoint: $HEALTH_ENDPOINT"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_ENDPOINT" 2>&1 | tail -1)
CURL_EXIT_CODE=${PIPESTATUS[0]}

# If curl failed, try to get exit code
if [ "$CURL_EXIT_CODE" -ne 0 ]; then
  # Check if it's an SSL error (exit code 60)
  if [ "$CURL_EXIT_CODE" -eq 60 ]; then
    HTTP_STATUS="SSL_ERROR"
  else
    HTTP_STATUS="000"
  fi
fi

if [ "$HTTP_STATUS" == "200" ]; then
  echo "✅ HTTPS accessible: HTTP 200"
  HTTPS_READY=true
elif [ "$HTTP_STATUS" == "SSL_ERROR" ] || [ "$CURL_EXIT_CODE" -eq 60 ]; then
  echo "⚠️  HTTPS test failed: SSL certificate error (certificate not yet provisioned)"
  HTTPS_READY=false
elif [ "$HTTP_STATUS" == "000" ]; then
  echo "⚠️  HTTPS test failed: Connection timeout or unreachable"
  HTTPS_READY=false
else
  echo "⚠️  HTTPS test: HTTP $HTTP_STATUS (may indicate SSL not ready)"
  HTTPS_READY=false
fi

echo ""

# Check HTTP (non-HTTPS) accessibility
echo "Testing HTTP endpoint (should redirect to HTTPS)..."
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$DOMAIN/health" 2>/dev/null || echo "000")

if [ "$HTTP_REDIRECT" == "301" ] || [ "$HTTP_REDIRECT" == "302" ]; then
  echo "✅ HTTP redirects to HTTPS: HTTP $HTTP_REDIRECT"
elif [ "$HTTP_REDIRECT" == "200" ]; then
  echo "⚠️  HTTP accessible (should redirect to HTTPS)"
else
  echo "⚠️  HTTP test: HTTP $HTTP_REDIRECT"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ "$SSL_READY" == true ] && [ "$HTTPS_READY" == true ]; then
  echo "✅ SSL Certificate: READY"
  echo "✅ HTTPS Access: WORKING"
  echo ""
  echo "🎉 SSL certificate is fully provisioned and working!"
  echo "You can now test the full end-to-end flow."
  exit 0
elif [ "$SSL_READY" == true ] && [ "$HTTPS_READY" == false ]; then
  echo "⚠️  SSL Certificate: Provisioned (sslState: $SSL_STATE)"
  echo "⚠️  HTTPS Access: Not yet working"
  echo ""
  echo "SSL certificate appears to be provisioned but may need a few more minutes"
  echo "to become fully active. Continue monitoring."
  exit 1
else
  echo "⏳ SSL Certificate: Still provisioning"
  echo "⏳ HTTPS Access: Not yet available"
  echo ""
  echo "SSL certificate is still being provisioned by Azure."
  echo "This can take up to 24 hours from domain configuration."
  echo "Continue monitoring periodically."
  exit 1
fi

