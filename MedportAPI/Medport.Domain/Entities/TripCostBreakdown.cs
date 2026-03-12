using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("TripCostBreakdown")]
public class TripCostBreakdown
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }

    public decimal BaseRevenue { get; set; }

    public decimal MileageRevenue { get; set; }

    public decimal PriorityRevenue { get; set; }

    public decimal SpecialRequirementsRevenue { get; set; }

    public decimal InsuranceAdjustment { get; set; }

    public decimal TotalRevenue { get; set; }

    public decimal CrewLaborCost { get; set; }

    public decimal VehicleCost { get; set; }

    public decimal FuelCost { get; set; }

    public decimal MaintenanceCost { get; set; }

    public decimal OverheadCost { get; set; }

    public decimal TotalCost { get; set; }

    public decimal GrossProfit { get; set; }

    public decimal ProfitMargin { get; set; }

    public decimal RevenuePerMile { get; set; }

    public decimal CostPerMile { get; set; }

    public decimal LoadedMileRatio { get; set; }

    public decimal DeadheadMileRatio { get; set; }

    public decimal UtilizationRate { get; set; }

    public decimal TripDistance { get; set; }

    public decimal LoadedMiles { get; set; }

    public decimal DeadheadMiles { get; set; }

    public decimal TripDurationHours { get; set; }

    public string TransportLevel { get; set; }

    public string PriorityLevel { get; set; }

    public Guid? CostCenterId { get; set; }

    public string? CostCenterName { get; set; }

    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
