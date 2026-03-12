using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medport.Infrastructure.Persistence.EntityFramework.Configurations;

public class AgencyResponseConfiguration : IEntityTypeConfiguration<AgencyResponse>
{
    public void Configure(EntityTypeBuilder<AgencyResponse> builder)
    {
        builder.HasKey(ar => ar.Id);

        builder.Property(ar => ar.Response).IsRequired().HasMaxLength(20);

        builder.HasOne(ar => ar.TransportRequest)
            .WithMany(tr => tr.AgencyResponses)
            .HasForeignKey(ar => ar.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ar => ar.AssignedUnit)
            .WithMany(u => u.AgencyResponses)
            .HasForeignKey(ar => ar.AssignedUnitId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
