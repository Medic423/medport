using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class PickupLocationConfiguration : IEntityTypeConfiguration<PickupLocation>
{
    public void Configure(EntityTypeBuilder<PickupLocation> builder)
    {
        builder.HasKey(pl => pl.Id);

        builder.Property(pl => pl.Name).IsRequired().HasMaxLength(255);

        builder.HasIndex(pl => pl.FacilityId);
        builder.HasIndex(pl => pl.IsActive);

        builder.HasOne(pl => pl.Facility)
            .WithMany(f => f.PickupLocations)
            .HasForeignKey(pl => pl.FacilityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}