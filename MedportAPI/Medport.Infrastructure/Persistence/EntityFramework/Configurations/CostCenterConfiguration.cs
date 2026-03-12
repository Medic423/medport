using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class CostCenterConfiguration : IEntityTypeConfiguration<CostCenter>
{
    public void Configure(EntityTypeBuilder<CostCenter> builder)
    {
        builder.HasKey(cc => cc.Id);

        builder.HasIndex(cc => cc.Code).IsUnique();

        builder.Property(cc => cc.OverheadRate).HasColumnType("decimal(5,2)");
        builder.Property(cc => cc.FixedCosts).HasColumnType("decimal(10,2)");
        builder.Property(cc => cc.VariableCosts).HasColumnType("decimal(10,2)");
    }
}