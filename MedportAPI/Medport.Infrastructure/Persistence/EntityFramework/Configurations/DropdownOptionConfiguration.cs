using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class DropdownOptionConfiguration : IEntityTypeConfiguration<DropdownOption>
{
    public void Configure(EntityTypeBuilder<DropdownOption> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Category).IsRequired().HasMaxLength(50);
        builder.Property(o => o.Value).IsRequired().HasMaxLength(255);

        builder.HasIndex(o => new { o.Category, o.Value }).IsUnique();
        builder.HasIndex(o => o.Category);

        builder.HasOne(o => o.DropdownCategory)
            .WithMany(dc => dc.Options)
            .HasForeignKey(o => o.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}