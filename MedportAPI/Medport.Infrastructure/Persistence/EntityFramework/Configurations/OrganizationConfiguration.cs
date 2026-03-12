using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Name).IsRequired().HasMaxLength(255);
        builder.Property(o => o.Email).HasMaxLength(254);

        builder.HasIndex(o => o.OrganizationType);
        builder.HasIndex(o => o.IsActive);

        builder.Property(o => o.OperatingHours).HasColumnType("nvarchar(max)");
        builder.Property(o => o.PricingStructure).HasColumnType("nvarchar(max)");
        builder.Property(o => o.AvailabilityStatus).HasColumnType("nvarchar(max)");
        builder.Property(o => o.Coordinates).HasColumnType("nvarchar(max)");

        builder.Property(o => o.Capabilities)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        builder.Property(o => o.ServiceArea)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        builder.Property(o => o.NotificationMethods)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);
    }
}