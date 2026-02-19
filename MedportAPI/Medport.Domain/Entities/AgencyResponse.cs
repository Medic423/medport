using System;

namespace Medport.Domain.Entities
{
    public class AgencyResponse
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid TransportRequestId { get; set; }

        public Guid AgencyId { get; set; }

        public Guid EmsUserId { get; set; }

        public string Response { get; set; } // ACCEPTED, DECLINED, PENDING

        public string ResponseNotes { get; set; }

        public double? EstimatedEta { get; set; }

        public string Status { get; set; } = "PENDING";

        public DateTime RespondedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual TransportRequest TransportRequest { get; set; }

        public virtual EmsAgency Agency { get; set; }

        public virtual EmsUser EmsUser { get; set; }
    }
}