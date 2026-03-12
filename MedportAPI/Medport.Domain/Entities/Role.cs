using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("Role")]
public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } // ADMIN, DISPATCHER, FACILITY_USER, EMS_SUBUSER

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
