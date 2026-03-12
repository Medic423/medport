using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class CategoryDefaultConfiguration : IEntityTypeConfiguration<CategoryDefault>
{
    public void Configure(EntityTypeBuilder<CategoryDefault> builder)
    {
        builder.HasKey(cd => cd.Id);

        builder.HasIndex(cd => cd.Category).IsUnique();
        builder.HasIndex(cd => cd.OptionId).IsUnique();

        builder.HasOne(cd => cd.Option)
            .WithOne(o => o.DefaultFor)
            .HasForeignKey<CategoryDefault>(cd => cd.OptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}