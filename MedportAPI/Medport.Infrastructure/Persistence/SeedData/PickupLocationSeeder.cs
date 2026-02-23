using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Medport.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Seeder for creating pickup locations for hospitals and healthcare locations.
    /// </summary>
    public class PickupLocationSeeder
    {
        private readonly MedportDbContext _context;
        private readonly ILogger<PickupLocationSeeder> _logger;

        public PickupLocationSeeder(MedportDbContext context, ILogger<PickupLocationSeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task SeedHospitalPickupLocationsAsync(Hospital hospital)
        {
            if (hospital == null)
            {
                throw new ArgumentNullException(nameof(hospital));
            }

            var locations = new List<(string Name, string Description, string Phone, string Floor, string Room)>();

            if (hospital.Name == "Altoona Regional Health System")
            {
                locations = new List<(string, string, string, string, string)>
                {
                    ("Emergency Department Main Entrance", "Main ED entrance", "(814) 889-2011", "1", "Main Entrance"),
                    ("Emergency Department Alternate", "Alternate ED entrance for stretchers", "(814) 889-2011", "1", "ED Bay"),
                    ("Main Hospital Entrance", "Main hospital entrance", "(814) 889-2011", "1", "Lobby"),
                    ("ICU Floor", "ICU pickup location", "(814) 889-2011", "3", "ICU Wing"),
                    ("Surgery Recovery", "Post-surgical recovery pickup", "(814) 889-2011", "2", "PACU"),
                };
            }
            else if (hospital.Name == "UPMC Bedford")
            {
                locations = new List<(string, string, string, string, string)>
                {
                    ("Emergency Department", "Main ED entrance", "(814) 623-3331", "1", "ED Lobby"),
                    ("Main Entrance", "Main hospital entrance", "(814) 623-3331", "1", "Front Lobby"),
                    ("ICU Entrance", "ICU transfer location", "(814) 623-3331", "2", "ICU"),
                };
            }

            var processedCount = 0;
            foreach (var (name, description, phone, floor, room) in locations)
            {
                var existingLocation = _context.PickupLocations
                    .FirstOrDefault(p => p.HospitalId == hospital.Id && p.Name == name);

                if (existingLocation == null)
                {
                    var location = new PickupLocation
                    {
                        Id = $"pickup-{DateTime.Now.Ticks}-{Guid.NewGuid().ToString("N").Substring(0, 9)}",
                        HospitalId = hospital.Id,
                        Name = name,
                        Description = description,
                        ContactPhone = phone,
                        Floor = floor,
                        Room = room,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.PickupLocations.Add(location);
                    processedCount++;
                }
            }

            if (processedCount > 0)
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("✅ {Count} pickup locations created for {Hospital}", processedCount, hospital.Name);
            }
        }

        public async Task SeedHealthcareLocationPickupLocationsAsync(HealthcareUser user, List<HealthcareLocation> locations)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            if (locations == null || !locations.Any())
            {
                return;
            }

            var pickupLocationData = new List<(string LocationName, string Name, string Description, string Phone)>
            {
                ("Penn Highlands Brookville", "Emergency Department", "Main ED", "(814) 849-1852"),
                ("Penn Highlands Brookville", "Main Entrance", "Main hospital entrance", "(814) 849-1852"),
                ("Penn Highlands DuBois", "Emergency Department", "Main ED", "(814) 371-2200"),
                ("Penn Highlands DuBois", "Main Entrance", "Main entrance", "(814) 371-2200"),
                ("Penn Highlands Mon Valley", "Emergency Department", "Main ED", "(724) 258-1000"),
                ("Penn Highlands Mon Valley", "Patient Tower", "Patient tower entrance", "(724) 258-1000"),
                ("Penn Highlands Clearfield", "Emergency Department", "Main ED", "(814) 765-5300"),
                ("Penn Highlands Clearfield", "Main Entrance", "Main entrance", "(814) 765-5300"),
                ("Penn Highlands Elk", "Emergency Department", "Main ED", "(814) 834-4200"),
                ("Penn Highlands Elk", "Main Entrance", "Main entrance", "(814) 834-4200"),
                ("Penn Highlands State College", "Emergency Department", "Main ED", "(814) 231-7000"),
                ("Penn Highlands State College", "Main Entrance", "Main entrance", "(814) 231-7000"),
                ("Penn Highlands Connellsville", "Emergency Department", "Main ED", "(724) 628-1500"),
                ("Penn Highlands Connellsville", "Main Entrance", "Main entrance", "(724) 628-1500"),
                ("Penn Highlands Huntingdon", "Emergency Department", "Main ED", "(814) 643-3300"),
                ("Penn Highlands Huntingdon", "Main Entrance", "Main entrance", "(814) 643-3300"),
                ("Penn Highlands Tyrone", "Emergency Department", "Main ED", "(814) 684-1255"),
                ("Penn Highlands Tyrone", "Main Entrance", "Main entrance", "(814) 684-1255"),
            };

            var processedCount = 0;
            foreach (var (locationName, name, description, phone) in pickupLocationData)
            {
                var healthcareLocation = locations.FirstOrDefault(l => l.LocationName == locationName);
                if (healthcareLocation == null)
                {
                    continue;
                }

                var existingPickup = _context.PickupLocations
                    .FirstOrDefault(p => p.HospitalId == healthcareLocation.Id && p.Name == name);

                if (existingPickup == null)
                {
                    var location = new PickupLocation
                    {
                        Id = $"pickup-{DateTime.Now.Ticks}-{Guid.NewGuid().ToString("N").Substring(0, 9)}",
                        HospitalId = healthcareLocation.Id,
                        Name = name,
                        Description = description,
                        ContactPhone = phone,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.PickupLocations.Add(location);
                    processedCount++;
                }
            }

            if (processedCount > 0)
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("✅ {Count} pickup locations created for {User}", processedCount, user.Email);
            }
        }
    }
}