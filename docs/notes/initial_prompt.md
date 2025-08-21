# Initial Prompt - Cursor

I'm designing an application that will seamlessly integrate a "medical transport coordination" system across multiple platforms, in either a brower extension or Progressive Web App (PWA).

**The PWA should be a unified codebase that:**  
• Works in any modern web browser on desktop, laptop, tablet, and smartphone.  
• Can be pinned to a home screen and launches like a native app  
• Provides offline access and background sync  
• Requires no app store approval for updates, speeding iteration  
• Seamlessly integrates with device features (notifications, limited offline storage, etc.)

# Goals & Context

You are developing a standalone Transport Dashboard to coordinate interfacility EMS transfers, focusing on availability of ambulances in the hospital service area, optimizing loaded miles, minimizing EMS unit usage, and increasing routing efficiency.

## How it Works:  
It is used by EMS coordinators and administrative staff to manage, assign, and optimize patient transports between hospitals, from hospitals to nursing homes or other health care facilities such as a cancer center or rehabilitation facility that is seperate from the hospital. 

Initial development has this as a seperate tool from the ChartCoach project that is currently under development, but palanning should allow for scaffolding code for easier integration. 

## Core Goals:

1.  Track active and pending transport requests
2.  Auto-calculate loaded miles using a distance matrix
3.  Suggest optimized EMS routes (pairing/chaining)
4.  Minimize EMS units needed while maximizing efficiency
5.  Export and manage assignments

## Components Needed
**Use Case**
An RN needs to have a patient transferred from the ICU to an off site cancer care center for treatment and then after treatment a return trip will be needed. This will most often take the form of two trips by two different transport agencies. The capabilities of the transport agency have to match the needs of the patient being transported. 
For example if the patient is coming out of the ICU with medication's being delived by IV the transporting unit will have to be ALS (Advanced Life Support) normally staffed at the paramedic level. A wheelchair van or BLS (Basic Life Support) ambulance staffed by EMT's would not be appropriate.  

### UI 
## Transport Dashboard Modules:

### Status Board 
**Elements**
- Incoming transfer requests by email, text or manually entered at the keyboard
- Status
- Patient waiting for arrival of transport
- Patient has been picked-up
- Patient names should not be used to make HIPPA compliance easier.
- A non-identifyable number should be assigned. This number could be generated in the system when a trip is entered into the system. It should also be timestamped when the request comes in and when the patient is marked as being picked up by the transport agency. 

### Transport Agency Availability
- Public facing option where EMS services could log on and show what units they have available. 
- The services could also see what patients are awaiting transports and **request** the transport. 
- The application could also look at the destinations and offer a service trips that are located close to each other.
- Transports should have a special marking if they are an LDT (Long Distance Transfer). Some transport agencies perfer these tranports since they generate the most revenue. 

**Boosts loaded miles and revenue for the hosptial the service or both ???**

### Trip Generation
When ever a trip is entered into the system it would automatically generate a text and email so staff spends less time on the phone searching for a transport agency. 

**The Transfer Requests screen would show:**
- Origin Facility
- Destination Facility
- Time Requested
- Transport Level (BLS, ALS, CCT)
- Status (Pending, Scheduled, In-Transit, Complete)
- Calculated: Estimated Loaded Miles, Route ID

### Route asignment
**DistanceMatrix**
- Editable matrix of loaded miles between UPMC hospitals and rehab/nursing facilities
**RouteOptimizer**
- Compares open transfers
- Flags routable pairs or chained legs
- Outputs route cards
- Summary: miles saved, units saved
**UnitAssignment**
- Assign EMS units to routes
- Visual tracking of mileage per unit per shift

System will also track the number of transports each agency takes.

## Settings
### Service Configuration 
Service Name
Email 
Phone
Contacts

## Enhancements:
- Push alerts for new requests
- QR code printouts
- Real-time tracking via AVL or CAD integration

## Tech Stack:
- React (backend)
- Versel front end
- LocalStorage or Firebase for persistence
- JavaScript-based route logic
- Workbox for offline use
- JSON-based Distance Matrix
- Google or Apple Maps integration
