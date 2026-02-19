using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Medport.Domain.Entities
{
    public class EmsAgency
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; }

        public string ContactName { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public string ZipCode { get; set; }

        public List<string> ServiceArea { get; set; } = new List<string>();

        public object OperatingHours { get; set; } // Can store JSON object

        public List<string> Capabilities { get; set; } = new List<string>();

        public object PricingStructure { get; set; } // Can store JSON object

        public bool IsActive { get; set; } = true;

        public string Status { get; set; } = "ACTIVE";

        public Guid? AddedBy { get; set; }

        public DateTime? AddedAt { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public bool AcceptsNotifications { get; set; } = true;

        public object AvailabilityStatus { get; set; } // JSON: { "isAvailable": bool, "availableLevels": string[] }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [JsonIgnore]
        public virtual ICollection<Unit> Units { get; set; } = new List<Unit>();

        [JsonIgnore]
        public virtual ICollection<AgencyResponse> AgencyResponses { get; set; } = new List<AgencyResponse>();
    }
}