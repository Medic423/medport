using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class PricingModelConfiguration : IEntityTypeConfiguration<PricingModel>
{
    public void Configure(EntityTypeBuilder<PricingModel> builder)
    {
        builder.HasKey(pm => pm.Id);

        builder.Property(pm => pm.BaseRates).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.PerMileRates).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.PriorityMultipliers).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.PeakHourMultipliers).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.WeekendMultipliers).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.SeasonalMultipliers).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.ZoneMultipliers).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.DistanceTiers).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.SpecialRequirements).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.InsuranceRates).HasColumnType("nvarchar(max)");
        builder.Property(pm => pm.IsolationPricing).HasColumnType("decimal(8,2)");
        builder.Property(pm => pm.BariatricPricing).HasColumnType("decimal(8,2)");
        builder.Property(pm => pm.OxygenPricing).HasColumnType("decimal(8,2)");
        builder.Property(pm => pm.MonitoringPricing).HasColumnType("decimal(8,2)");
    }
}