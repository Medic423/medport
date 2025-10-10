# EMS Transport Optimizer MVP

## Overview

This project is a minimal viable product (MVP) for optimizing **non-emergency medical transport (NEMT) and interfacility transfers**.  
It allows hospitals to submit transport requests and EMS agencies to run lightweight route optimization to reduce deadhead miles, improve loaded-mile ratio (LMR), and maximize revenue per unit-hour.

The system includes:

- A **Queue API** for managing transport requests
- An **Optimization service** for suggesting the next best job or pairing/backhaul
- A simple **Hospital UI** for request submission
- An **EMS UI** for route planning and dispatch
- Basic **KPIs** for monitoring efficiency

* * *

## Features

- Submit transfer requests with LOS (BLS/ALS/CCT), pickup windows, and flags (isolation, bariatric, etc.)
- EMS agencies run optimization to select best-fit jobs
- Simple backhaul pairing heuristic (90 min, 15 mi radius, toward base)
- Assignment lifecycle (open → assigned → complete)
- KPIs: **Loaded-mile ratio**, **\$/unit-hr**, **% paired trips**, **Accept→Pickup median**

* * *

## API Endpoints

### Requests

- `POST /requests` → Create a new transfer request
- `GET /requests?status=open` → List open requests
- `PATCH /requests/:id` → Update status (`open|assigned|done|canceled`)

### Optimization

- `POST /optimize/next` → Suggest next job for a given EMS unit
- *(optional)* `POST /optimize/pairing` → Suggest backhaul after a drop

### Assignments

- `POST /assignments` → Create assignment
- `PATCH /assignments/:id` → Update assignment status (`accept|decline|lock|complete`)

### Static Data

- `GET /rates` → Show reimbursement schedule
- `GET /lanes` → Show predefined lane distances


## Data Model

### Requests

```json
{
  "id": 1,
  "origin": "UPMC Bedford",
  "destination": "UPMC Altoona",
  "los_required": "ALS",
  "ready_start": "2025-09-05T10:00:00Z",
  "ready_end": "2025-09-05T12:00:00Z",
  "service_time_min": 15,
  "flags": ["Isolation"],
  "est_loaded_miles": 32,
  "status": "open"
}
```

### UNITS
{  
  "unit_id": "MEDIC-12",  
  "base": "Bedford",  
  "los_capability": "ALS",  
  "shift_start": "2025-09-05T08:00:00Z",  
  "shift_end": "2025-09-05T20:00:00Z",  
  "cost_per_hr": 85,  
  "cost_per_mile": 2.25,  
  "max_radius_mi": 50,  
  "capabilities": \["Isolation", "Monitor"\]  
}

### KPIS
- **Loaded-Mile Ratio (LMR)** = loaded_miles / total_miles
- **Revenue per Unit-Hour** = (Σ assignment revenue) / (unit-hours active)  
- **% Paired Trips** = backhauled_legs / total_legs
- **Median Accept→Pickup (min)**
    

## Setup
### Requirements

- Node.js or Python backend (SQLite for MVP)
- REST client (e.g., Postman) for testing
- React (Tailwind + Shadcn) frontend
    
### Installation

# clone repo  
git clone https://github.com/your-org/ems-optimizer-mvp.git  
cd ems-optimizer-mvp

# install dependencies  
npm install # or pip install -r requirements.txt

# seed data  
cp seed/rates.json db/  
cp seed/lanes.json db/

# run server  
npm run dev # or python app.py

## Usage

1.  Hospital submits transfer request via UI or API.
2.  EMS runs `/optimize/next` to get suggested assignment.
3.  EMS accepts assignment, status updates in dispatch console.
4.  KPI dashboard updates automatically.
    
## Roadmap

- Add mapping service (real mileage/time estimates)
- Advanced multi-trip optimization
- Multi-agency support
- Payer-specific reimbursement contracts