# Kudu Navigation Steps - Check if dist/index.js Exists

## Step-by-Step Instructions

### Step 1: Navigate to Site Directory
1. In the "Browse Directory" section, click **"Site wwwroot"**
2. This will show you the contents of `/home/site/wwwroot/`

### Step 2: Check for dist folder
1. Look for a folder named **"dist"**
2. If you see it, click on it
3. If you DON'T see it, that's the problem - the build didn't create it

### Step 3: Check for index.js
1. Inside the `dist` folder, look for **"index.js"**
2. Check the file size (should be > 0 bytes)
3. If it exists, note the size
4. If it doesn't exist, that's why the backend isn't starting

## What to Look For

### ✅ Good Signs:
- `dist` folder exists
- `index.js` exists inside `dist`
- File size > 0 bytes (e.g., 50KB+)
- Other `.js` files in `dist` folder

### ❌ Bad Signs:
- No `dist` folder = Build failed
- `dist` folder exists but empty = Build didn't create files
- `dist/index.js` doesn't exist = Build didn't create the file
- `dist/index.js` exists but 0 bytes = Build created empty file

## Alternative: Use Bash Tab

If browsing is difficult, you can use the command line:

1. Click **"Bash"** tab (in the navigation bar)
2. Run: `cd /home/site/wwwroot && ls -la`
3. Check if `dist` folder exists
4. Run: `cd dist && ls -la` (if dist exists)
5. Check if `index.js` exists

## What to Report Back

Please tell me:
1. ✅ or ❌ - Does `dist` folder exist?
2. ✅ or ❌ - Does `index.js` exist inside `dist`?
3. File size of `index.js` (if it exists)
4. Any other files in `dist` folder

---

**Last Updated:** January 5, 2026  
**Status:** Instructions for checking dist/index.js

