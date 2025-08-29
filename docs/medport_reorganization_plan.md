Medport Restart

I believe this project has to many problems and has lost sight of the original goal; leading me to ask if we should continue in the current framework or start a new project from scratch. 

Let me restate the original intent of Medport. We designed it to be a Transfer Optimization Platform for EMS + hospitals, which does two things:

1.    Maximizes EMS efficiency & revenue by batching, routing, and assigning inter facility transports in a way that minimizes downtime, empty miles, and billing denials.
2.    Saves hospitals money by removing the nurse/case manager from the "phone tree," reducing wasted clinical hours and freeing staff for patient care.

We are targeting a niche that's not completely served by generic fleet tools or academic models-specifically:
* Combined EMS and hospital workflow optimization not just dispatch or routing.
*   Built end-to-end for interfacility transfers, including efficiency, revenue capture, and payer-aware logic.
*   Customizable to small rural EMS operations (e.g., Bedford, PA), filling a gap left by high-end logistics systems or broad NEMT platforms.

There are vendors tackling regional inter-facility transfer (IFT) orchestration and a few that touch ambulance routing/assignment, but nobody (yet) nails "pool all IFT requests from multiple hospitals in a region and optimize EMS efficiency + revenue across agencies" as a single, out-of-the-box product. 
This "pool all IFT requests from multiple hospitals in a region” concept is the heart of our overall concept of being a transport operations coordination center (TOCC).  

Our wedge is that existing transfer-center tools optimize patient flow for a health system; EMS CAD tools optimize a single agency's routing.
  The gap is a neutral, region-wide IFT marketplace/optimizer that: 
(1) aggregates requests from hospitals large and small
(2) assigns trips across multiple EMS agencies to cut deadhead miles and maximize billable miles acuity mix
(3) automates payer-aware documentation (PCS, nearest-appropriate-facility logic) to reduce denials.The overall design of the software is simple. There will be three different logins:
1. Hospitals and other care facilities 
    * Menu configured only for modules/tabs dedicated to hospital/other health are facility operations. Status board shows only the transfers/trips they have posted.
2. EMS & transport agencies (ambulances, wheelchair vans)
    * Menu configured only for modules/tabs dedicated to EMS, van or other transport providers. Status board shows all the transfers/trips posted in the system and filterable by things such as distance, care level required, ALS, BLS, CCT. 
    * Will have an insurance optimizer with “who to bill” for ITF’s. More detailed context will be provided when we build the module.
3. Center Operations 
    * Visibility of all Hospital and EMS modules and tabs. 
    * Any speciality system monitoring functions for the operations center staff. 