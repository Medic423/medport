using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Medport.Domain.Entities;

[Table("Unit")]
public class Unit
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid AgencyId { get; set; }

    public string UnitNumber { get; set; }

    public string Type { get; set; } // AMBULANCE, HELICOPTER, FIRE_TRUCK, etc.

    public string Status { get; set; } = "AVAILABLE";

    public string CurrentStatus { get; set; } = "AVAILABLE";

    public string? CurrentLocation { get; set; }

    public List<string> Capabilities { get; set; } = new List<string>();

    public int CrewSize { get; set; } = 2;

    public List<string> Equipment { get; set; } = new List<string>();

    public string? Location { get; set; } // JSON

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public DateTime? LastMaintenance { get; set; }

    public DateTime? NextMaintenance { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastStatusUpdate { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Organization Agency { get; set; }

    [JsonIgnore]
    public virtual ICollection<TransportRequest> AssignedTrips { get; set; } = new List<TransportRequest>();

    public virtual UnitAnalytics? Analytics { get; set; }

    [JsonIgnore]
    public virtual ICollection<AgencyResponse> AgencyResponses { get; set; } = new List<AgencyResponse>();
}