using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("CategoryDefault")]
public class CategoryDefault
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Category { get; set; }

    public Guid OptionId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual DropdownOption Option { get; set; }
}
