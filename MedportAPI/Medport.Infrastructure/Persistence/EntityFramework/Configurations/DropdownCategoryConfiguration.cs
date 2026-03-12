using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class DropdownCategoryConfiguration : IEntityTypeConfiguration<DropdownCategory>
{
    public void Configure(EntityTypeBuilder<DropdownCategory> builder)
    {
        builder.HasKey(dc => dc.Id);

        builder.Property(dc => dc.Slug).IsRequired().HasMaxLength(50);
        builder.Property(dc => dc.DisplayName).IsRequired().HasMaxLength(100);

        builder.HasIndex(dc => dc.Slug).IsUnique();
    }
}