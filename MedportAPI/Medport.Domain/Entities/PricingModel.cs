using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("PricingModel")]
public class PricingModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? AgencyId { get; set; }

    public string Name { get; set; }

    public bool IsActive { get; set; } = true;

    public string BaseRates { get; set; } // JSON

    public string PerMileRates { get; set; } // JSON

    public string PriorityMultipliers { get; set; } // JSON

    public string PeakHourMultipliers { get; set; } // JSON

    public string WeekendMultipliers { get; set; } // JSON

    public string SeasonalMultipliers { get; set; } // JSON

    public string ZoneMultipliers { get; set; } // JSON

    public string DistanceTiers { get; set; } // JSON

    public string SpecialRequirements { get; set; } // JSON

    public decimal? IsolationPricing { get; set; }

    public decimal? BariatricPricing { get; set; }

    public decimal? OxygenPricing { get; set; }

    public decimal? MonitoringPricing { get; set; }

    public string InsuranceRates { get; set; } // JSON

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
