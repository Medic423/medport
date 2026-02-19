using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class HealthcareLocation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid HealthcareUserId { get; set; }

        public string LocationName { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public string ZipCode { get; set; }

        public string Phone { get; set; }

        public string FacilityType { get; set; } // HOSPITAL, CLINIC, URGENT_CARE, etc.

        public bool IsPrimary { get; set; }

        public bool IsActive { get; set; } = true;

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<PickupLocation> PickupLocations { get; set; } = new List<PickupLocation>();
    }
}