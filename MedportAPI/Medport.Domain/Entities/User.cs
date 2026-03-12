using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("User")]
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Email { get; set; }

    public string Password { get; set; }

    public string Name { get; set; }

    public string UserType { get; set; } // SYSTEM_ADMIN, HEALTHCARE_ORGANIZATION_USER, EMS_ORGANIZATION_USER

    public Guid? OrganizationId { get; set; }

    public bool MustChangePassword { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public DateTime? LastLogin { get; set; }

    public DateTime? LastActivity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Organization? Organization { get; set; }

    public virtual ICollection<UserPreference> Preferences { get; set; } = new List<UserPreference>();

    public virtual ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();

    public virtual ICollection<TransportRequest> CreatedTrips { get; set; } = new List<TransportRequest>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
