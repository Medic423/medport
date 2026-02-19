using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class Hospital
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public string ZipCode { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public string Type { get; set; } // HOSPITAL, CLINIC, etc.

        public List<string> Capabilities { get; set; } = new List<string>();

        public string Region { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public string OperatingHours { get; set; }

        public bool IsActive { get; set; } = true;

        public bool RequiresReview { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public Guid? ApprovedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}