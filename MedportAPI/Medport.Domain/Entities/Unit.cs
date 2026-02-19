using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class Unit
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid AgencyId { get; set; }

        public string UnitNumber { get; set; }

        public string Type { get; set; } // AMBULANCE, HELICOPTER, FIRE_TRUCK, etc.

        public List<string> Capabilities { get; set; } = new List<string>();

        public string Status { get; set; } = "AVAILABLE";

        public string CurrentStatus { get; set; } = "AVAILABLE";

        public string CurrentLocation { get; set; } // Stores JSON string: { "lat": number, "lng": number }

        public int CrewSize { get; set; } = 2;

        public List<string> Equipment { get; set; } = new List<string>();

        public DateTime? ShiftStart { get; set; }

        public DateTime? ShiftEnd { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastMaintenance { get; set; }

        public DateTime? NextMaintenance { get; set; }

        public DateTime? LastStatusUpdate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual EmsAgency Agency { get; set; }
    }
}