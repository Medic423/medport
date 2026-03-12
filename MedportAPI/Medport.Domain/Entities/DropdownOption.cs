using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("DropdownOption")]
public class DropdownOption
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Category { get; set; }

    public Guid? CategoryId { get; set; }

    public string Value { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual DropdownCategory? DropdownCategory { get; set; }

    public virtual CategoryDefault? DefaultFor { get; set; }
}