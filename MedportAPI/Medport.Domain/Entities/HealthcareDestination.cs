using System;

namespace Medport.Domain.Entities
{
    public class HealthcareDestination
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid HealthcareUserId { get; set; }

        public string DestinationName { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public string ZipCode { get; set; }

        public string Phone { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public string FacilityType { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}