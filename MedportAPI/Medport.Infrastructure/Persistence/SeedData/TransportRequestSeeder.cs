using System;
using System.Threading.Tasks;
using Medport.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Seeder for creating sample transport requests.
    /// </summary>
    public class TransportRequestSeeder
    {
        private readonly MedportDbContext _context;
        private readonly ILogger<TransportRequestSeeder> _logger;

        public TransportRequestSeeder(MedportDbContext context, ILogger<TransportRequestSeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task SeedSampleTransportRequestAsync(Facility originFacility, Facility destinationFacility, HealthcareUser createdBy)
        {
            if (originFacility == null)
            {
                throw new ArgumentNullException(nameof(originFacility));
            }

            if (destinationFacility == null)
            {
                throw new ArgumentNullException(nameof(destinationFacility));
            }

            if (createdBy == null)
            {
                throw new ArgumentNullException(nameof(createdBy));
            }

            var transportRequest = new TransportRequest
            {
                PatientId = "PAT-001",
                OriginFacilityId = originFacility.Id,
                DestinationFacilityId = destinationFacility.Id,
                TransportLevel = "ALS",
                Priority = "MEDIUM",
                Status = "PENDING",
                SpecialRequirements = "Oxygen required",
                CreatedById = createdBy.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.TransportRequests.Add(transportRequest);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Transport request created: {Id}", transportRequest.Id);
        }
    }
}