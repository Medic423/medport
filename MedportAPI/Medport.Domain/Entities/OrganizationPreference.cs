using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("OrganizationPreference")]
public class OrganizationPreference
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrganizationId { get; set; }

    public string PreferenceType { get; set; } // PREFERRED_EMS_AGENCY

    public Guid? TargetOrganizationId { get; set; }

    public string? Value { get; set; } // JSON

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Organization Organization { get; set; }

    public virtual Organization? TargetOrganization { get; set; }
}
