using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
{
    public void Configure(EntityTypeBuilder<UserPreference> builder)
    {
        builder.HasKey(up => up.Id);

        builder.HasIndex(up => new { up.UserId, up.PreferenceType }).IsUnique();
        builder.HasIndex(up => up.UserId);

        builder.Property(up => up.Value).HasColumnType("nvarchar(max)");

        builder.HasOne(up => up.User)
            .WithMany(u => u.Preferences)
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}