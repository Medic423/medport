using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class BackhaulOpportunityConfiguration : IEntityTypeConfiguration<BackhaulOpportunity>
{
    public void Configure(EntityTypeBuilder<BackhaulOpportunity> builder)
    {
        builder.HasKey(bo => bo.Id);

        builder.Property(bo => bo.RevenueBonus).HasColumnType("decimal(10,2)");
        builder.Property(bo => bo.Efficiency).HasColumnType("decimal(5,2)");
    }
}