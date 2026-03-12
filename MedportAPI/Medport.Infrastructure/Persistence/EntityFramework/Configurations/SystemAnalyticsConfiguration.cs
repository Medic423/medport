using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class SystemAnalyticsConfiguration : IEntityTypeConfiguration<SystemAnalytics>
{
    public void Configure(EntityTypeBuilder<SystemAnalytics> builder)
    {
        builder.HasKey(sa => sa.Id);

        builder.Property(sa => sa.MetricValue).HasColumnType("nvarchar(max)");
    }
}