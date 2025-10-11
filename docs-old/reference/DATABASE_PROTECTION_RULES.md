# Database Protection Rules - CRITICAL

**Last Updated:** October 10, 2025  
**Context:** After October 9th regression incident

---

## 🚨 **THE ONLY RULE THAT MATTERS**

### **AI MUST NEVER RUN DATABASE MIGRATIONS WITHOUT EXPLICIT USER APPROVAL**

---

## 🎯 **What Caused Yesterday's Regression:**

The AI attempted to "fix" a perceived database issue by:
1. Running Prisma migrations automatically
2. Modifying database schema
3. Removing working code that depended on existing tables

**Result:** Hours of lost work, broken units functionality, complete system restore required.

---

## ✅ **THE PROTECTION STRATEGY**

### **1. NO Automatic Migrations**
```bash
# AI must NEVER run these without approval:
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push
npx prisma migrate reset
```

### **2. AI Must ASK First**
Before running ANY Prisma migration or schema change, AI must:
1. **STOP** and describe the proposed change
2. **EXPLAIN** why the change is needed
3. **WAIT** for explicit user approval: "Yes, run the migration"
4. **ONLY THEN** execute the command

### **3. User Testing First**
The existing workflow already works:
1. AI makes code changes
2. User tests in UI
3. User says "commit this" or "this works"
4. AI commits

**This workflow prevents regressions!**

---

## 🛡️ **What Actually Protects the Database:**

1. ✅ **Daily Backups** - Working perfectly (saved us today!)
2. ✅ **Git History** - Clean commits = easy rollback
3. ✅ **User Testing** - Catch issues before commits
4. ✅ **This Document** - Reminds AI to ask before migrations

---

## 🚫 **What DOESN'T Work:**

- ❌ Runtime middleware (breaks the app)
- ❌ Blocking legitimate user operations
- ❌ Complex protection systems that interfere with normal work

---

## 📋 **WORKFLOW FOR DATABASE CHANGES**

### **When Database Changes ARE Needed:**

**Step 1: User Requests Change**
```
User: "Add a new field to the units table"
```

**Step 2: AI Proposes Change**
```
AI: "I need to modify the Prisma schema and run a migration:
     - Add field 'serialNumber' to Unit model
     - Run: npx prisma migrate dev --name add_serial_number
     
     May I proceed with this migration?"
```

**Step 3: User Approves**
```
User: "Yes, run the migration"
```

**Step 4: AI Executes**
```
AI: Runs migration with --force-reset flag for non-interactive mode
```

**Step 5: User Tests**
```
User: Tests the change in UI
```

**Step 6: Commit or Rollback**
```
If good: User says "commit this"
If bad: Restore from backup
```

---

## 🎓 **LESSONS LEARNED**

1. **Simple is better** - Complex protection systems break things
2. **Backups save lives** - Daily backups prevented disaster
3. **User testing works** - Existing workflow prevents issues
4. **AI asking permission** - The simplest, most effective protection

---

## 🔄 **RECOVERY PROCESS (Used Today)**

When regression happens:
1. Identify last known good backup
2. Stop servers
3. Restore from backup directory
4. Install dependencies
5. Start servers
6. Test functionality
7. Continue working

**Time saved:** Restoring took 5 minutes vs. hours of debugging

---

## ✍️ **AI PLEDGE**

I will NEVER run database migrations, schema changes, or Prisma commands without:
1. Clearly explaining what I want to do
2. Asking for explicit approval
3. Waiting for user to say "yes, proceed"
4. Using appropriate flags (--force-reset) for non-interactive execution

**This is the ONLY protection needed.**
