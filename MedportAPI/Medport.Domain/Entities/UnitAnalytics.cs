using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("UnitAnalytics")]
public class UnitAnalytics
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UnitId { get; set; }

    public decimal? PerformanceScore { get; set; }

    public decimal? Efficiency { get; set; }

    public int TotalTrips { get; set; }

    public int TotalTripsCompleted { get; set; }

    public decimal? AverageResponseTime { get; set; }

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Unit Unit { get; set; }
}
