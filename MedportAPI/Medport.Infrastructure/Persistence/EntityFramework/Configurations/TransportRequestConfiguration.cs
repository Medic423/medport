using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class TransportRequestConfiguration : IEntityTypeConfiguration<TransportRequest>
{
    public void Configure(EntityTypeBuilder<TransportRequest> builder)
    {
        builder.HasKey(tr => tr.Id);

        builder.HasIndex(tr => tr.TripNumber)
            .IsUnique()
            .HasFilter("[TripNumber] IS NOT NULL");

        builder.HasIndex(tr => tr.Status);
        builder.HasIndex(tr => tr.FromLocationId);
        builder.HasIndex(tr => tr.IsMultiLocationFacility);
        builder.HasIndex(tr => tr.RequestTimestamp);

        builder.Property(tr => tr.PatientId).IsRequired().HasMaxLength(100);
        builder.Property(tr => tr.TransportLevel).IsRequired().HasMaxLength(20);
        builder.Property(tr => tr.Priority).IsRequired().HasMaxLength(20);
        builder.Property(tr => tr.Status).IsRequired().HasMaxLength(20);

        builder.Property(tr => tr.SelectedAgencies)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(2000);

        // All FKs use NoAction to prevent multiple cascade path errors in SQL Server
        builder.HasOne(tr => tr.OriginFacility)
            .WithMany(f => f.OriginTrips)
            .HasForeignKey(tr => tr.OriginFacilityId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(tr => tr.DestinationFacility)
            .WithMany(f => f.DestinationTrips)
            .HasForeignKey(tr => tr.DestinationFacilityId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(tr => tr.FromFacility)
            .WithMany(f => f.FromTrips)
            .HasForeignKey(tr => tr.FromLocationId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(tr => tr.PickupLocation)
            .WithMany(pl => pl.Trips)
            .HasForeignKey(tr => tr.PickupLocationId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(tr => tr.AssignedUnit)
            .WithMany(u => u.AssignedTrips)
            .HasForeignKey(tr => tr.AssignedUnitId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(tr => tr.CreatedByUser)
            .WithMany(u => u.CreatedTrips)
            .HasForeignKey(tr => tr.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}