using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("RouteOptimizationSettings")]
public class RouteOptimizationSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? AgencyId { get; set; }

    public decimal DeadheadMileWeight { get; set; } = 1.0m;

    public decimal WaitTimeWeight { get; set; } = 1.0m;

    public decimal BackhaulBonusWeight { get; set; } = 1.0m;

    public decimal OvertimeRiskWeight { get; set; } = 1.0m;

    public decimal RevenueWeight { get; set; } = 1.0m;

    public decimal MaxDeadheadMiles { get; set; } = 50.0m;

    public int MaxWaitTimeMinutes { get; set; } = 30;

    public decimal MaxOvertimeHours { get; set; } = 4.0m;

    public int MaxResponseTimeMinutes { get; set; } = 15;

    public decimal MaxServiceDistance { get; set; } = 100.0m;

    public int BackhaulTimeWindow { get; set; } = 60;

    public decimal BackhaulDistanceLimit { get; set; } = 25.0m;

    public decimal BackhaulRevenueBonus { get; set; } = 50.0m;

    public bool EnableBackhaulOptimization { get; set; } = true;

    public decimal TargetLoadedMileRatio { get; set; } = 0.75m;

    public decimal TargetRevenuePerHour { get; set; } = 200.0m;

    public int TargetResponseTime { get; set; } = 12;

    public decimal TargetEfficiency { get; set; } = 0.85m;

    public string OptimizationAlgorithm { get; set; } = "HYBRID";

    public int MaxOptimizationTime { get; set; } = 30;

    public bool EnableRealTimeOptimization { get; set; } = true;

    public decimal CrewAvailabilityWeight { get; set; } = 1.0m;

    public decimal EquipmentCompatibilityWeight { get; set; } = 1.0m;

    public decimal PatientPriorityWeight { get; set; } = 1.0m;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
