using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class UnitAnalyticsConfiguration : IEntityTypeConfiguration<UnitAnalytics>
{
    public void Configure(EntityTypeBuilder<UnitAnalytics> builder)
    {
        builder.HasKey(ua => ua.Id);

        builder.HasIndex(ua => ua.UnitId).IsUnique();

        builder.Property(ua => ua.PerformanceScore).HasColumnType("decimal(5,2)");
        builder.Property(ua => ua.Efficiency).HasColumnType("decimal(5,2)");
        builder.Property(ua => ua.AverageResponseTime).HasColumnType("decimal(5,2)");

        builder.HasOne(ua => ua.Unit)
            .WithOne(u => u.Analytics)
            .HasForeignKey<UnitAnalytics>(ua => ua.UnitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}