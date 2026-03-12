using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("BackhaulOpportunity")]
public class BackhaulOpportunity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string TripId1 { get; set; }

    public string TripId2 { get; set; }

    public decimal? RevenueBonus { get; set; }

    public decimal? Efficiency { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
}
