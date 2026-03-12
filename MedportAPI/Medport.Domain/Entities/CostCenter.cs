using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("CostCenter")]
public class CostCenter
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; }

    public string? Description { get; set; }

    public string Code { get; set; }

    public decimal OverheadRate { get; set; }

    public decimal FixedCosts { get; set; }

    public decimal VariableCosts { get; set; }

    public string AllocationMethod { get; set; } = "TRIP_COUNT";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
