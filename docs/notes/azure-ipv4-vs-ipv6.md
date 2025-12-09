# Azure PostgreSQL: IPv4 vs IPv6
**Last Updated:** December 8, 2025

## Problem

When checking your IP, you got:
- **IPv6:** `2601:985:4380:2520:d1a6:c8a8:b238:f238`
- **Azure needs:** IPv4 address (like `98.123.45.67`)

## Solution: Get IPv4 Address

Azure PostgreSQL firewall requires IPv4 addresses, not IPv6.

### Get Your IPv4 Address:

```bash
curl -4 ifconfig.me
```

The `-4` flag forces IPv4.

### Alternative Commands:

```bash
# Method 1: Force IPv4
curl -4 ifconfig.me

# Method 2: Use IPv4 service
curl -4 ipv4.icanhazip.com

# Method 3: Use different service
curl -4 api.ipify.org
```

## Add IPv4 to Azure Firewall

1. **Get your IPv4:**
   ```bash
   curl -4 ifconfig.me
   ```
   Should return something like: `98.123.45.67`

2. **Add to Azure:**
   - Azure Portal → PostgreSQL Server → Networking
   - Add the IPv4 address (not the IPv6)
   - Save

3. **Connect:**
   - pgAdmin should now connect successfully

## Why This Happens

- Your Mac has both IPv4 and IPv6 addresses
- `curl ifconfig.me` without `-4` may return IPv6
- Azure PostgreSQL firewall typically only accepts IPv4
- Use `curl -4` to force IPv4 response

## Verify Your IPs

```bash
# IPv4 address (for Azure)
curl -4 ifconfig.me

# IPv6 address (not needed for Azure)
curl -6 ifconfig.me
```

## After Adding IPv4

Once you add your IPv4 address to Azure firewall:
1. ✅ pgAdmin should connect successfully
2. ✅ Run baseline SQL
3. ✅ Verify migrations
4. ✅ Re-run GitHub Actions

