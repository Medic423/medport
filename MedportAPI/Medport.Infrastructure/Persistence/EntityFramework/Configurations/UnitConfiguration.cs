using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.UnitNumber).IsRequired().HasMaxLength(50);

        builder.HasIndex(u => new { u.AgencyId, u.UnitNumber }).IsUnique();
        builder.HasIndex(u => u.AgencyId);
        builder.HasIndex(u => u.Status);

        builder.Property(u => u.Capabilities)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        builder.Property(u => u.Equipment)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(1000);

        builder.Property(u => u.CurrentLocation).HasColumnType("nvarchar(max)");
        builder.Property(u => u.Location).HasColumnType("nvarchar(max)");

        builder.HasOne(u => u.Agency)
            .WithMany(o => o.Units)
            .HasForeignKey(u => u.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}