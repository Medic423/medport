using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("SystemAnalytics")]
public class SystemAnalytics
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string MetricName { get; set; }

    public string MetricValue { get; set; } // JSON

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
