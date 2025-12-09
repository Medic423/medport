# EMS Transport Optimizer (MVP)

A lightweight backend + frontend prototype for hospital transport requests and EMS route optimization.  

This MVP connects **hospitals → transport request queue → EMS units → optimized dispatch** with a focus on feasibility, speed, and measurable efficiency.

* * *

## 🚀 Features

- **Hospital Request Portal**
    
    - Submit requests with LOS (BLS/ALS/CCT), pickup window, and special flags (Isolation, Bariatric, etc.)
    - View request status (open / assigned / done / canceled)
- **EMS Route Optimization**
    
    - Greedy scorer suggests the **next best job** for a unit
    - Backhaul detection (after drop, check nearby pickups within 90 min / 15 mi)
    - KPI strip: Loaded-mile ratio, \$/unit-hr, Accept→Pickup time
- **Dispatch Console**
    
    - Live assignment tracking: `En-route | On-scene | Transport | Complete | Canceled`
    - Assignment acceptance/decline with lock option

* * *

## 📦 Tech Stack

- **Backend**: Node.js + Express (SQLite for MVP persistence)
- **Frontend**: React + Tailwind (minimal hospital & EMS pages)
- **Database**: SQLite (requests, units, assignments)
- **APIs**:
    - `/requests` (CRUD)
    - `/optimize/next` (next best job for unit)
    - `/assignments` (create/update/track)
    - `/rates`, `/lanes` (seed static data)

* * *

## 📂 Project Structure

├── backend/ # Express server  
│ ├── routes/ # API endpoints  
│ ├── models/ # SQLite models  
│ ├── seed/ # rates.json, lanes.json  
│ └── app.js # entry point  
│  
├── frontend/ # React UI  
│ ├── pages/  
│ │ ├── Hospital.js # Hospital request UI  
│ │ ├── EMS.js # EMS optimizer  
│ │ └── Dispatch.js # Dispatch console  
│ └── App.js  
│  
├── db.sqlite # local database (auto-generated)  
├── README.md  
└── package.json

* * *

## ⚡ Quick Start

### 1\. Clone repo

```bash
git clone https://github.com/your-org/ems-transport-optimizer.git
cd ems-transport-optimizer
```

### 2\. Install deps

```
npm install
```

### 3\. Seed database

```
npm run seed
```

### 4\. Start backend

```
npm run server
```

### 5\. Start frontend

```
npm run client  
Backend runs at http://localhost:4000  
Frontend runs at http://localhost:3000
```

## 🔑 Example API Calls

### Create request

POST /requests  
{  
  "origin": "Bedford Hospital",  
  "destination": "Altoona Hospital",  
  "los_required": "ALS",  
  "ready_start": "2025-09-05T10:00:00Z",  
  "ready_end": "2025-09-05T11:00:00Z",  
  "flags": \["Isolation"\]  
}

Optimize for a unit

POST /optimize/next  
{  
  "unit_id": "ALS-12",  
  "now": "2025-09-05T09:30:00Z"  
}

## 📊 Metrics (MVP)

- **Loaded-mile ratio (LMR)**
    
- **% paired/backhaul legs**
    
- **Accept→Pickup median time**
    
- **\$ per unit-hour**
    

* * *

## 🛡️ Roles & Permissions

- **Hospital users** → Create/edit their own requests
    
- **EMS users** → View requests, run optimizer, accept jobs
    
- **Dispatch** → Track all assignments in console
    

* * *

## ✅ Acceptance Criteria

- Hospital can submit request with LOS + time window.
    
- EMS unit can run optimizer and receive feasible job.
    
- System suggests at least one valid backhaul when available.
    
- KPIs update after each completed job.
    

* * *

## 🧪 Pilot Scope

- Initial test on **Bedford ↔ Altoona** lane
    
- Seeded with payer schedule + canonical lane miles