# SMS Log Filtering Commands

Quick reference for filtering SMS-related logs from backend terminal output.

## Quick Commands

### 1. Basic SMS Filter
```bash
# Filter for SMS-related messages
grep -i "SMS\|notification\|radius\|trigger\|📱\|🌐.*POST.*trips" <log_file>
```

### 2. SMS Trigger Check (Most Important)
```bash
# Look for SMS trigger conditions
grep -E "SMS TRIGGER CHECK|notificationRadius|SMS conditions met|SMS not triggered" <log_file>
```

### 3. Request Flow Tracking
```bash
# Track trip creation requests
grep -E "GLOBAL REQUEST LOGGER|POST.*enhanced|CREATE ENHANCED TRIP|notificationRadius" <log_file>
```

### 4. Complete SMS Flow
```bash
# Full SMS flow from request to sending
grep -E "GLOBAL REQUEST LOGGER|POST.*enhanced|SMS TRIGGER CHECK|SMS conditions|SMS notification|tripSMSService|sendTripCreationSMS" <log_file>
```

### 5. With Context (shows surrounding lines)
```bash
# Show 3 lines before and after each match
grep -E -A 3 -B 3 "SMS TRIGGER CHECK|notificationRadius|SMS conditions" <log_file>
```

## Real-Time Filtering

### Option 1: Pipe nodemon output
If you're running `npm run dev` in one terminal, you can't easily pipe it. Instead:

### Option 2: Save logs to file and tail
```bash
# In backend directory, redirect output to log file
npm run dev 2>&1 | tee backend.log

# In another terminal, tail and filter:
tail -f backend.log | grep -E "SMS|notification|radius|trigger|📱|🌐"
```

### Option 3: Use the grep script
```bash
# Pipe logs through the filter script
tail -f backend.log | ./grep-sms-logs.sh
```

## Key Log Patterns to Look For

### When Trip is Created:
1. `🌐 GLOBAL REQUEST LOGGER: POST to trips` - Request received
2. `🔍 TCC_DEBUG: POST /enhanced route handler called` - Route handler hit
3. `🚨 TCC_DEBUG: CREATE ENHANCED TRIP REQUEST RECEIVED` - Trip creation started
4. `📱 SMS TRIGGER CHECK` - SMS check begins
5. `TCC_DEBUG: Checking SMS trigger conditions` - Conditions being evaluated
6. `SMS conditions met` OR `SMS not triggered` - Result

### SMS Sending:
- `TCC_DEBUG: Starting SMS notification for trip`
- `TCC_DEBUG: Found X agencies within radius`
- `TCC_DEBUG: Sending SMS to agency`
- `TCC_DEBUG: SMS sent successfully`

## Example: Complete Filter Command

```bash
# Most comprehensive filter - shows everything SMS-related
grep -E --color=always \
  "SMS|notification|radius|trigger|📱|🌐.*POST|tripSMSService|sendTripCreationSMS|SMS conditions|SMS sent|SMS failed" \
  backend.log | tail -50
```

## Quick Test

After creating a trip, run:
```bash
# Check if SMS trigger was hit
grep "SMS TRIGGER CHECK" backend.log | tail -5

# Check notificationRadius value
grep "notificationRadius" backend.log | tail -10

# Check if SMS was sent
grep "SMS sent\|SMS failed\|SMS notification" backend.log | tail -10
```

