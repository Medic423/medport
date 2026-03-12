using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("AgencyResponse")]
public class AgencyResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }

    public Guid AgencyId { get; set; }

    public string Response { get; set; } // ACCEPTED, DECLINED, PENDING

    public DateTime ResponseTimestamp { get; set; } = DateTime.UtcNow;

    public string? ResponseNotes { get; set; }

    public DateTime? EstimatedArrival { get; set; }

    public bool IsSelected { get; set; }

    public Guid? AssignedUnitId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual TransportRequest TransportRequest { get; set; }

    public virtual Unit? AssignedUnit { get; set; }
}