using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class TripConfiguration : IEntityTypeConfiguration<Trip>
{
    public void Configure(EntityTypeBuilder<Trip> builder)
    {
        builder.HasKey(t => t.Id);

        builder.HasIndex(t => t.TripNumber).IsUnique();

        builder.Property(t => t.SelectedAgencies)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(2000);

        builder.Property(t => t.Efficiency).HasColumnType("decimal(5,2)");
        builder.Property(t => t.InsurancePayRate).HasColumnType("decimal(10,2)");
        builder.Property(t => t.LoadedMiles).HasColumnType("decimal(10,2)");
        builder.Property(t => t.PerMileRate).HasColumnType("decimal(8,2)");
        builder.Property(t => t.PerformanceScore).HasColumnType("decimal(5,2)");
        builder.Property(t => t.RevenuePerHour).HasColumnType("decimal(10,2)");
        builder.Property(t => t.TripCost).HasColumnType("decimal(10,2)");

        builder.HasOne(t => t.PickupLocation)
            .WithMany(pl => pl.LegacyTrips)
            .HasForeignKey(t => t.PickupLocationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}