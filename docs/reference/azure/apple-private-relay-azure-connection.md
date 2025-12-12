# Apple Private Relay and Azure Database Connection
**Last Updated:** December 8, 2025

## Problem

Apple Private Relay masks your IP address, causing:
- IP address changes frequently
- Azure firewall can't reliably whitelist your IP
- Connection timeouts and failures

## Your Situation

- **Current IP shown:** `140.248.1.132` (Apple Private Relay)
- **Your real IP:** Starts with `98.*` (your actual public IP)

## Solution: Disable Private Relay Temporarily

### Option 1: Disable Private Relay for This Connection

1. **System Settings:**
   - Apple Menu → **System Settings** (or System Preferences)
   - Click **Apple ID** (or your name)
   - Click **iCloud**
   - Click **Private Relay**
   - Toggle **Private Relay** OFF

2. **Get Your Real IP:**
   ```bash
   curl ifconfig.me
   ```
   Should now show your real IP (starting with 98.*)

3. **Add Real IP to Azure Firewall:**
   - Go to Azure Portal → PostgreSQL Server → Networking
   - Add your real IP (98.*)
   - Save

4. **Connect to Azure Database:**
   - Should work now with your real IP

5. **Re-enable Private Relay** after you're done (optional)

### Option 2: Add Both IPs to Azure Firewall

If you want to keep Private Relay enabled:

1. **Add Real IP (98.*):**
   - Get your real IP (disable Private Relay temporarily to see it)
   - Add to Azure firewall

2. **Add Private Relay IP (140.248.1.132):**
   - Add current Private Relay IP
   - Note: This IP may change, so you may need to update it

3. **Enable "Allow Azure Services":**
   - This allows GitHub Actions to connect regardless of IP

### Option 3: Use Azure Cloud Shell (Bypasses IP Issues)

If Private Relay is causing too many issues:

1. Go to Azure Portal
2. Click **Cloud Shell** (top right)
3. Select **Bash**
4. Run SQL directly from Cloud Shell
5. No IP whitelisting needed

## Check Your Real IP

With Private Relay disabled:
```bash
curl ifconfig.me
# Should show your real IP (98.*)
```

With Private Relay enabled:
```bash
curl ifconfig.me
# Shows Private Relay IP (140.248.* or similar)
```

## Why This Matters

Azure PostgreSQL firewall requires:
- Your exact IP address to be whitelisted
- Private Relay changes your IP frequently
- This causes connection failures

## Recommended Approach

**For Azure database connections:**
1. ✅ Disable Private Relay temporarily
2. ✅ Get your real IP (98.*)
3. ✅ Add real IP to Azure firewall
4. ✅ Connect and run baseline SQL
5. ✅ Re-enable Private Relay if desired

**For GitHub Actions:**
- Enable "Allow Azure Services" in Azure firewall
- This allows GitHub Actions regardless of IP

## Quick Steps

1. **Disable Private Relay:**
   - System Settings → Apple ID → iCloud → Private Relay → OFF

2. **Get Real IP:**
   ```bash
   curl ifconfig.me
   ```

3. **Add to Azure:**
   - Azure Portal → PostgreSQL → Networking → Add your real IP

4. **Connect:**
   - Try pgAdmin connection again

5. **Re-enable Private Relay** (optional, after you're done)

