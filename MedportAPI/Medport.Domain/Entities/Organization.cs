using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Medport.Domain.Entities;

[Table("Organization")]
public class Organization
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; }

    public string OrganizationType { get; set; } // HEALTHCARE, EMS

    public string? ContactName { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? ZipCode { get; set; }

    public List<string> ServiceArea { get; set; } = new List<string>();

    public string? OperatingHours { get; set; } // JSON

    public List<string> Capabilities { get; set; } = new List<string>();

    public string? PricingStructure { get; set; } // JSON

    public bool IsActive { get; set; } = true;

    public string Status { get; set; } = "ACTIVE";

    public string? AddedBy { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public bool AcceptsNotifications { get; set; } = true;

    public DateTime? ApprovedAt { get; set; }

    public string? ApprovedBy { get; set; }

    public int AvailableUnits { get; set; }

    public int TotalUnits { get; set; }

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? Coordinates { get; set; } // JSON

    public List<string> NotificationMethods { get; set; } = new List<string>();

    public bool RequiresReview { get; set; }

    public int? ServiceRadius { get; set; }

    public string? AvailabilityStatus { get; set; } // JSON

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public virtual ICollection<User> Users { get; set; } = new List<User>();

    [JsonIgnore]
    public virtual ICollection<Facility> Facilities { get; set; } = new List<Facility>();

    [JsonIgnore]
    public virtual ICollection<Unit> Units { get; set; } = new List<Unit>();

    [JsonIgnore]
    public virtual ICollection<OrganizationPreference> Preferences { get; set; } = new List<OrganizationPreference>();

    [JsonIgnore]
    public virtual ICollection<OrganizationPreference> IncomingPreferences { get; set; } = new List<OrganizationPreference>();

    [JsonIgnore]
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
