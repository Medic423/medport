using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("UserRole")]
public class UserRole
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public Guid RoleId { get; set; }

    public Guid? OrganizationId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; }

    public virtual Role Role { get; set; }

    public virtual Organization? Organization { get; set; }
}
