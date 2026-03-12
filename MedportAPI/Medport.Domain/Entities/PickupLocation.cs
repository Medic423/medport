using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("PickupLocation")]
public class PickupLocation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FacilityId { get; set; }

    public string Name { get; set; }

    public string? Description { get; set; }

    public string? ContactPhone { get; set; }

    public string? ContactEmail { get; set; }

    public string? Floor { get; set; }

    public string? Room { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Facility Facility { get; set; }

    public virtual ICollection<TransportRequest> Trips { get; set; } = new List<TransportRequest>();

    public virtual ICollection<Trip> LegacyTrips { get; set; } = new List<Trip>();
}