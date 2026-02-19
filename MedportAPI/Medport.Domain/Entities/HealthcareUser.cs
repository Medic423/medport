using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class HealthcareUser
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Email { get; set; }

        public string Password { get; set; }

        public string Name { get; set; }

        public string FacilityName { get; set; }

        public string FacilityType { get; set; }

        public string UserType { get; set; } = "HEALTHCARE";

        public bool IsActive { get; set; } = true;

        public bool IsSubUser { get; set; }

        public Guid? ParentUserId { get; set; }

        public bool OrgAdmin { get; set; }

        public bool ManageMultipleLocations { get; set; }

        public DateTime? LastLogin { get; set; }

        public DateTime? LastActivity { get; set; }

        public DateTime? DeletedAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool MustChangePassword { get; set; }

        // Navigation properties
        public virtual ICollection<HealthcareLocation> Locations { get; set; } = new List<HealthcareLocation>();

        public virtual ICollection<TransportRequest> CreatedTransportRequests { get; set; } = new List<TransportRequest>();
    }
}