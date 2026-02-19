using System;

namespace Medport.Domain.Entities
{
    public class PickupLocation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid HospitalId { get; set; } // Can reference Hospital or HealthcareLocation

        public string Name { get; set; }

        public string Description { get; set; }

        public string ContactPhone { get; set; }

        public string ContactEmail { get; set; }

        public string Floor { get; set; }

        public string Room { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}