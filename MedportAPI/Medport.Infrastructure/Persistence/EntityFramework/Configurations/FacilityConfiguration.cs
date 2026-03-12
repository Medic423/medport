using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class FacilityConfiguration : IEntityTypeConfiguration<Facility>
{
    public void Configure(EntityTypeBuilder<Facility> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name).IsRequired().HasMaxLength(255);

        builder.HasIndex(f => f.OrganizationId);
        builder.HasIndex(f => f.FacilityType);
        builder.HasIndex(f => f.IsActive);

        builder.Property(f => f.Capabilities)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        builder.Property(f => f.Coordinates).HasColumnType("nvarchar(max)");

        builder.HasOne(f => f.Organization)
            .WithMany(o => o.Facilities)
            .HasForeignKey(f => f.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}