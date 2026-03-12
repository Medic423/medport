using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
{
    public void Configure(EntityTypeBuilder<NotificationLog> builder)
    {
        builder.HasKey(nl => nl.Id);

        builder.HasIndex(nl => nl.UserId);

        builder.HasOne(nl => nl.User)
            .WithMany(u => u.NotificationLogs)
            .HasForeignKey(nl => nl.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}