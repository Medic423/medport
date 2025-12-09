# MedPort MVP

MedPort is a lightweight MVP for coordinating hospital transport requests and EMS unit routing.  
It connects hospitals submitting patient transfer requests with EMS agencies optimizing routes, assignments, and backhauls.

## 🚀 Features

### Hospital Portal

- Create **transport requests** with:
    - Pickup & drop-off
    - Level of Service (BLS, ALS, CCT)
    - Time window (`ready_start`, `ready_end`)
    - Flags (Isolation, Bariatric, O₂, Monitor, Escort)
- Auto-calculated **miles & ETA risk** using lane library
- SLA countdown timer (accept → pickup within 60 minutes)
- Bulk actions & quick **audit notes**

### EMS Optimization

- Input constraints: LOS capability, shift times, max radius, intercept allowed
- Greedy **scorer** (revenue – cost – deadhead + backhaul bonus)
- Hard filters: LOS, flags, time windows, shift fit
- Route card with ETAs, deadhead/loaded miles, revenue est.
- One-click **Accept assignment**
- **Backhaul suggestions** when a drop-off is near another request
- KPIs: Loaded Mile Ratio, % paired, \$/unit-hr, Accept→Pickup median

### Center/Dispatch Console

- Assignment lifecycle: Planned → En-route → On-scene → Transport → Complete
- Live KPI strip for each unit
- Backhaul prompts after each completed trip

* * *

## 📦 Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (via `better-sqlite3`)
- **Optimizer**: TypeScript scorer (`optimize_next.ts`)
- **Static Data**: `rates.json` (payer × LOS), `lanes.json` (canonical miles/minutes)
- **Frontend**: React (or any SPA hitting API endpoints)

* * *

## 🗂️ Project Structure

medport-mvp/  
├── db.ts # SQLite setup  
├── optimize_next.ts # Greedy scoring & route optimizer  
├── rates.json # Rate table  
├── lanes.json # Lane mileage/time library  
├── server.ts # Express API entrypoint  
└── README.md # This file

## 🔑 API Endpoints

### Requests

- `POST /requests` – Create new request
- `GET /requests?status=open` – List open requests
- `PATCH /requests/:id` – Update status or edit fields

### Optimization

- `POST /optimize/next` – Suggest next assignment given a unit + open requests

### Assignments

- `POST /assignments` – Create assignment
- `PATCH /assignments/:id` – Update status (planned → enroute → complete, etc.)

### Static

- `GET /rates` – Payer × LOS table
- `GET /lanes` – Canonical mileage/time between hospitals

* * *

## 🗄️ Database Schema

```sql
CREATE TABLE requests(
  id TEXT PRIMARY KEY,
  origin TEXT, destination TEXT,
  los_required TEXT,
  ready_start TEXT, ready_end TEXT,
  service_time_min INTEGER DEFAULT 15,
  flags_json TEXT,
  est_loaded_miles REAL,
  payer_class TEXT,
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units(
  unit_id TEXT PRIMARY KEY,
  base TEXT, los_capability TEXT,
  shift_start TEXT, shift_end TEXT,
  max_radius_mi REAL, intercept_ok INTEGER,
  cost_per_hr REAL, cost_per_mile REAL,
  capabilities_json TEXT
);

CREATE TABLE assignments(
  id TEXT PRIMARY KEY,
  req_id TEXT, unit_id TEXT,
  eta_pickup TEXT, eta_drop TEXT,
  deadhead_mi REAL, loaded_mi REAL,
  revenue_est REAL,
  status TEXT DEFAULT 'planned',
  locked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## ⚡ Getting Started

### 1. Clone repo & install deps

git clone https://github.com/your-org/medport-mvp.git  
cd medport-mvp  
npm install

### 2. Run database migrations
npx ts-node db.ts

### 3. Start backend
npx ts-node server.ts

### 4. Test with sample requests

curl -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -d '{
    "id": "req-001",
    "origin": "Bedford Hospital",
    "destination": "Altoona Hospital",
    "los_required": "ALS",
    "ready_start": "2025-09-05T10:00:00Z",
    "ready_end": "2025-09-05T11:00:00Z",
    "flags_json": "[\"O2\"]"
  }'

📊 MVP Success Criteria
- Hospital can create a request with LOS + window
- EMS can accept a feasible optimizer suggestion
- System proposes at least one valid backhaul
- KPI strip updates live with LMR, % paired, $/unit-hr, and Accept→Pickup median

🔮 Next Steps
- Add Hungarian assignment for pairing optimization
- Map-based routing (instead of canonical miles)
- Role-based auth & subscription plans
- Full VRP-TW solver (OR-Tools)