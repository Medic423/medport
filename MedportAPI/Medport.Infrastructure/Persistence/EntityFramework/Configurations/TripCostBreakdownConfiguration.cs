using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class TripCostBreakdownConfiguration : IEntityTypeConfiguration<TripCostBreakdown>
{
    public void Configure(EntityTypeBuilder<TripCostBreakdown> builder)
    {
        builder.HasKey(tcb => tcb.Id);

        builder.Property(tcb => tcb.BaseRevenue).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.MileageRevenue).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.PriorityRevenue).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.SpecialRequirementsRevenue).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.InsuranceAdjustment).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.TotalRevenue).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.CrewLaborCost).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.VehicleCost).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.FuelCost).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.MaintenanceCost).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.OverheadCost).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.TotalCost).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.GrossProfit).HasColumnType("decimal(10,2)");
        builder.Property(tcb => tcb.ProfitMargin).HasColumnType("decimal(5,2)");
        builder.Property(tcb => tcb.RevenuePerMile).HasColumnType("decimal(8,2)");
        builder.Property(tcb => tcb.CostPerMile).HasColumnType("decimal(8,2)");
        builder.Property(tcb => tcb.LoadedMileRatio).HasColumnType("decimal(3,2)");
        builder.Property(tcb => tcb.DeadheadMileRatio).HasColumnType("decimal(3,2)");
        builder.Property(tcb => tcb.UtilizationRate).HasColumnType("decimal(3,2)");
        builder.Property(tcb => tcb.TripDistance).HasColumnType("decimal(6,2)");
        builder.Property(tcb => tcb.LoadedMiles).HasColumnType("decimal(6,2)");
        builder.Property(tcb => tcb.DeadheadMiles).HasColumnType("decimal(6,2)");
        builder.Property(tcb => tcb.TripDurationHours).HasColumnType("decimal(4,2)");
    }
}