using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class OrganizationPreferenceConfiguration : IEntityTypeConfiguration<OrganizationPreference>
{
    public void Configure(EntityTypeBuilder<OrganizationPreference> builder)
    {
        builder.HasKey(op => op.Id);

        builder.HasIndex(op => new { op.OrganizationId, op.PreferenceType, op.TargetOrganizationId }).IsUnique();
        builder.HasIndex(op => op.OrganizationId);
        builder.HasIndex(op => op.TargetOrganizationId);

        builder.Property(op => op.Value).HasColumnType("nvarchar(max)");

        builder.HasOne(op => op.Organization)
            .WithMany(o => o.Preferences)
            .HasForeignKey(op => op.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(op => op.TargetOrganization)
            .WithMany(o => o.IncomingPreferences)
            .HasForeignKey(op => op.TargetOrganizationId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}