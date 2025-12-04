## Revenue Routes

Take EMS-side constraints (LOS capability, max distance, shift hours, staging base, intercept ability, overtime rules) + hospital transfer feed (ready-by window, LOS required, origin/destination, est. miles, payer) and generate routes that maximize net revenue and loaded-mile ratio while honoring all constraints.  
Here’s the plan I’d implement:

### 1.  Data we use  
    EMS unit table: unit_id, LOS_capability (BLS/ALS/CC), base_location, shift_start/shift_end, max_radius, intercept_ok (Y/N), cost_per_hour, cost_per_mile.  
    Transfer table: req_id, origin, destination, LOS_required, ready_window_start/end, service_time, est_loaded_miles, payer_class, base_rate, per_mile_rate.

### 2.  Objective (what we optimize)  

Σ(assign r to unit u) [ Revenue(r) – VariableCost(u,r) ]
  – λ1 * DeadheadMiles  – λ2 * LatePenalties  + λ3 * BackhaulPairs

    Maximize:  
    Σ(assign r to unit u) \[ Revenue(r) – VariableCost(u,r) \]  
    – λ1 \* DeadheadMiles – λ2 \* LatePenalties + λ3 \* BackhaulPairs  
    Revenue(r) = base_rate(LOS,payer) + per_mile_rate \* est_loaded_miles  
    VariableCost = labor(time_on_task) + cost_per_mile\*(deadhead+loaded)  
    Tunables λ1–λ3 push toward high loaded-mile ratio and paired backhauls.

### 3.  Constraints (hard rules)  
    LOS compatibility: unit_LOS ≥ req_LOS (or paramedic-intercept allowed).  
    Time windows: travel_time + service_time fits inside \[ready_start, ready_end\] and the crew’s shift.  
    Geography: distance within unit’s max_radius (or flagged for approval).  
    One request served at most once; unit sequence must be feasible (pickup→drop→next pickup).  
    Optional: isolation/equipment flags, no-mix rules, meal breaks, max continuous hours.

### 4.  Solver approach (practical & fast)  

score(u, r, t_now) =
  revenue(r)
  – α * deadhead_miles(u→r.origin)
  – β * wait_time(t_now→r.ready_start)
  + γ * backhaul_bonus(if r returns unit toward home/hub)
  – δ * overtime_risk
Pick the feasible r with max score.

    Daily plan (offline): Vehicle Routing Problem with Time Windows (VRP-TW), heterogeneous fleet, pickup-drop pairs → solved by MILP/OR-Tools.  
    Live dispatch (real-time): event-driven pairing & scoring heuristic:  
    score(u, r, t_now) =  
    revenue(r)  
    – α \* deadhead_miles(u→r.origin)  
    – β \* wait_time(t_now→r.ready_start)

- γ \* backhaul_bonus(if r returns unit toward home/hub)  
    – δ \* overtime_risk  
    Pick the feasible r with max score.  
    This gets you >80% of the optimal value in milliseconds and re-evaluates after every drop/cancel.

### 5.  Pairing engine (the loaded-miles booster)  
    After each drop, we run a bipartite match between “drops in next 90 min” and “pickups in opposite direction,” weighted by (added revenue – deadhead cost – wait penalty). That converts otherwise empty return legs into planned, billable backhauls.

### 6.  What you’ll see in the Dashboard  
    Route cards per unit (stop order with ETAs, LOS, payer, revenue each).  
    LMR (Loaded-Mile Ratio), % paired legs, \$ per unit-hour, and accept→pickup median.  
    “What-if” sliders: add/remove a unit, widen a ready window, change max distance, toggle intercept → instantly see revenue and LMR impact.

### 7.  Rollout in 2 weeks (using your files)  
    Ingest your Master List + monthly CSVs to learn lane miles & hour-of-day peaks.  
    Stand up the scoring heuristic (fast win) with your PA rates + payer classes.  
    Turn on transfer windows & return-pairing on Bedford↔Altoona first.  
    Add Shadyside/Hamot anchor runs and staging rules.  
    Optional: upgrade to full VRP-TW nightly planning once ops are stable.  
    If you want, I can mock this with a small, live dataset (your January–April files) and show:  
    baseline vs optimized LMR,  
    extra paired legs/week, and  
    net revenue lift for one EMS agency under realistic share and payer mix.