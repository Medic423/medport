# Creating a New Project from Scratch In Cursor 

This guide walks you through the process of starting a new project from scratch, following the established patterns used in the ChartCoach project.

## Prerequisites

- Node.js and npm installed
- Git installed
- Cursor IDE (or your preferred code editor)
- Basic familiarity with command line operations

## Step 1: Create Project Directory

**Do NOT use "File → New Text File"** - this only creates a single file, not a project structure.

### Option A: Command Line (Recommended)
# Navigate to your projects directory

cd /Users/scooper/Code

# Create new project folder
mkdir my-new-project
cd my-new-project

mkdir simmcoach 
cd simmcoach 

### Option B: Cursor IDE
1. Go to `File → Open Folder...`
2. Navigate to your desired location
3. Create a new folder there
4. Select and open the new folder


## Step 2: Initialize Project Structure

### Create the basic directory structure:
```bash
mkdir -p backend/src backend/prisma backend/scripts
mkdir -p frontend/src frontend/components frontend/pages
mkdir -p docs scripts
touch README.md
```

Your project structure should look like this:
```
my-new-project/
├── backend/
│   ├── src/
│   ├── prisma/
│   └── scripts/
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
├── docs/
├── scripts/
└── README.md
```

## Step 3: Backend Setup

### Navigate to backend directory:
```bash
cd backend
npm init -y
```

### Install core dependencies:
```bash
npm install express prisma @prisma/client cors helmet dotenv
npm install -D typescript @types/node @types/express ts-node nodemon
```

### Create TypeScript configuration (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Add scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Initialize Prisma:
```bash
npx prisma init
```

## Step 4: Frontend Setup

### Navigate to frontend directory:
```bash
cd ../frontend
npm init -y
```

### Install core dependencies:
```bash
npm install react react-dom react-router-dom
npm install -D @types/react @types/react-dom typescript vite @vitejs/plugin-react
```

### Create Vite configuration (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

### Add scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 5: Development Scripts

### Create development startup script (`scripts/start-dev-complete.sh`):
```bash
#!/bin/bash
echo "Starting development environment..."

# Kill any processes using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Development servers started on ports 3000 (frontend) and 5000 (backend)"
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

### Make it executable:
```bash
chmod +x scripts/start-dev-complete.sh
```

## Step 6: Environment Configuration

### Create environment files:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### Basic `.env` structure for backend:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
PORT=5000
NODE_ENV=development
```

### Basic `.env` structure for frontend:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=My New Project
```

## Step 7: Database Setup

### Initialize Prisma schema and run migrations:
```bash
cd backend
npx prisma generate
npx prisma db push
```

## Step 8: Basic Application Files

### Backend entry point (`backend/src/index.ts`):
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Frontend entry point (`frontend/src/main.tsx`):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Frontend App component (`frontend/src/App.tsx`):
```typescript
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to My New Project!</h1>
      <p>Your project is now running successfully.</p>
    </div>
  );
}

export default App;
```

### Frontend HTML template (`frontend/index.html`):
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My New Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 9: Start Development

### Run the complete development environment:
```bash
./scripts/start-dev-complete.sh
```

Your project should now be running with:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Step 10: Project Documentation

### Create essential documentation:
- `README.md` - Project overview and setup instructions
- `docs/` - Technical documentation
- `docs/end_to_end_user_testing.md` - Testing procedures
- `docs/deployment-guide.md` - Deployment instructions

### Basic README.md:
```markdown
# My New Project

## Description
Brief description of what this project does.

## Setup
1. Clone the repository
2. Install dependencies: `npm install` in both `backend/` and `frontend/` directories
3. Set up environment variables
4. Run `./scripts/start-dev-complete.sh`

## Development
- Frontend runs on port 3000
- Backend runs on port 5000
- Use `./scripts/start-dev-complete.sh` to start both servers

## Technologies
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript + Prisma
```

## Step 11: Version Control

### Initialize Git repository:
```bash
git init
git add .
git commit -m "Initial project setup"
```

### Create `.gitignore`:
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
```

## Step 12: Testing Setup

### Install testing dependencies:
```bash
# Backend
cd backend
npm install -D jest @types/jest ts-jest

# Frontend
cd ../frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Common Issues and Solutions

### Port already in use:
- The startup script automatically kills processes on port 3000
- If you have issues, manually kill processes: `lsof -ti:3000 | xargs kill -9`

### Dependencies not found:
- Ensure you're in the correct directory when running npm commands
- Run `npm install` in both `backend/` and `frontend/` directories

### TypeScript errors:
- Check that `tsconfig.json` is properly configured
- Ensure all necessary type definitions are installed

## Next Steps

After completing this setup:
1. Customize your project structure based on your needs
2. Add authentication, database models, and business logic
3. Implement your frontend components and pages
4. Set up CI/CD pipelines
5. Configure production deployment

## Summary

This setup provides a solid foundation for a full-stack TypeScript project with:
- React frontend with Vite
- Express backend with TypeScript
- Prisma database integration
- Comprehensive development tooling
- Proper project structure and organization
- Development scripts for easy startup

The structure follows the patterns established in the ChartCoach project while being adaptable for new projects of any scale.

