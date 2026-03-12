using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Medport.Domain.Entities;

[Table("Facility")]
public class Facility
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; }

    public Guid OrganizationId { get; set; }

    public string FacilityType { get; set; } // HOSPITAL, CLINIC, NURSING_HOME, REHAB_FACILITY, URGENT_CARE, OTHER

    public string Address { get; set; }

    public string City { get; set; }

    public string State { get; set; }

    public string ZipCode { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? ContactName { get; set; }

    public List<string> Capabilities { get; set; } = new List<string>();

    public string? Region { get; set; }

    public string? Coordinates { get; set; } // JSON

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? OperatingHours { get; set; }

    public bool IsPrimary { get; set; }

    public bool IsActive { get; set; } = true;

    public bool RequiresReview { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? ApprovedBy { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Organization Organization { get; set; }

    [JsonIgnore]
    public virtual ICollection<PickupLocation> PickupLocations { get; set; } = new List<PickupLocation>();

    [JsonIgnore]
    public virtual ICollection<TransportRequest> FromTrips { get; set; } = new List<TransportRequest>();

    [JsonIgnore]
    public virtual ICollection<TransportRequest> OriginTrips { get; set; } = new List<TransportRequest>();

    [JsonIgnore]
    public virtual ICollection<TransportRequest> DestinationTrips { get; set; } = new List<TransportRequest>();
}
