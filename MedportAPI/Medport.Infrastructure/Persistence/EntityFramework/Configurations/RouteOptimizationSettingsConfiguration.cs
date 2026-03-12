using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class RouteOptimizationSettingsConfiguration : IEntityTypeConfiguration<RouteOptimizationSettings>
{
    public void Configure(EntityTypeBuilder<RouteOptimizationSettings> builder)
    {
        builder.HasKey(ros => ros.Id);

        builder.Property(ros => ros.DeadheadMileWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.WaitTimeWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.BackhaulBonusWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.OvertimeRiskWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.RevenueWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.MaxDeadheadMiles).HasColumnType("decimal(6,2)");
        builder.Property(ros => ros.MaxOvertimeHours).HasColumnType("decimal(4,2)");
        builder.Property(ros => ros.MaxServiceDistance).HasColumnType("decimal(6,2)");
        builder.Property(ros => ros.BackhaulDistanceLimit).HasColumnType("decimal(6,2)");
        builder.Property(ros => ros.BackhaulRevenueBonus).HasColumnType("decimal(8,2)");
        builder.Property(ros => ros.TargetLoadedMileRatio).HasColumnType("decimal(3,2)");
        builder.Property(ros => ros.TargetRevenuePerHour).HasColumnType("decimal(8,2)");
        builder.Property(ros => ros.TargetEfficiency).HasColumnType("decimal(3,2)");
        builder.Property(ros => ros.CrewAvailabilityWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.EquipmentCompatibilityWeight).HasColumnType("decimal(5,2)");
        builder.Property(ros => ros.PatientPriorityWeight).HasColumnType("decimal(5,2)");
    }
}