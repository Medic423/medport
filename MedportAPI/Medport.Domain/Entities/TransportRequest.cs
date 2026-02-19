using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class TransportRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string PatientId { get; set; }

        public Guid OriginFacilityId { get; set; }

        public Guid DestinationFacilityId { get; set; }

        public string TransportLevel { get; set; } // BLS, ALS, CCT

        public string Priority { get; set; } = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

        public string Status { get; set; } = "PENDING";

        public string SpecialRequirements { get; set; }

        public DateTime RequestTimestamp { get; set; } = DateTime.UtcNow;

        public DateTime? ReadyStart { get; set; }

        public DateTime? ReadyEnd { get; set; }

        public Guid HealthcareCreatedById { get; set; }

        public Guid? AssignedAgencyId { get; set; }

        public Guid? AssignedUnitId { get; set; }

        public DateTime? AcceptedTimestamp { get; set; }

        public DateTime? PickupTimestamp { get; set; }

        public DateTime? CompletionTimestamp { get; set; }

        public string InsuranceCompany { get; set; }

        public double? InsurancePayRate { get; set; }

        public double? PerMileRate { get; set; }

        public double? DistanceMiles { get; set; }

        public int? PatientAge { get; set; }

        public string PatientAgeType { get; set; } // YEARS, MONTHS, WEEKS

        public int? NotificationRadius { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<AgencyResponse> AgencyResponses { get; set; } = new List<AgencyResponse>();
    }
}