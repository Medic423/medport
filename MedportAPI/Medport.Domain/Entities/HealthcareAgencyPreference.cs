using System;

namespace Medport.Domain.Entities
{
    public class HealthcareAgencyPreference
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid HealthcareUserId { get; set; }

        public Guid PreferredAgencyId { get; set; }

        public int PreferenceOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}