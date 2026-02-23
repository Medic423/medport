using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Medport.Domain.Entities;
using Medport.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Seeder for creating hospitals and healthcare facilities.
    /// </summary>
    public class FacilitySeeder
    {
        private readonly MedportDbContext _context;
        private readonly ILogger<FacilitySeeder> _logger;

        private static class HospitalData
        {
            public const string AltoonaName = "Altoona Regional Health System";
            public const string AltoonaAddress = "620 Howard Ave";
            public const string AltoonaCity = "Altoona";
            public const string AltoonaZip = "16601";
            public const string AltoonaPhone = "(814) 889-2011";
            public const string AltoonaEmail = "info@altoonaregional.org";

            public const string UpmcName = "UPMC Bedford";
            public const string UpmcAddress = "10455 Lincoln Hwy";
            public const string UpmcCity = "Everett";
            public const string UpmcZip = "15537";
            public const string UpmcPhone = "(814) 623-3331";
            public const string UpmcEmail = "info@upmc.edu";
        }

        public FacilitySeeder(MedportDbContext context, ILogger<FacilitySeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Hospital> SeedHospitalAsync(string name, string address, string city, 
            string state, string zipCode, string phone, string email, string type, 
            List<string> capabilities, string region, Coordinates coordinates, string operatingHours)
        {
            var existingHospital = _context.Hospitals.FirstOrDefault(h => h.Name == name);
            if (existingHospital != null)
            {
                return existingHospital;
            }

            var hospital = new Hospital
            {
                Name = name,
                Address = address,
                City = city,
                State = state,
                ZipCode = zipCode,
                Phone = phone,
                Email = email,
                Type = type,
                Capabilities = capabilities,
                Region = region,
                Coordinates = coordinates,
                OperatingHours = operatingHours,
                IsActive = true
            };

            _context.Hospitals.Add(hospital);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Hospital created: {Name}", hospital.Name);

            return hospital;
        }

        public async Task<Facility> SeedFacilityAsync(string name, string type, string address, 
            string city, string state, string zipCode, string phone, string email, 
            string region, Coordinates coordinates)
        {
            var existingFacility = _context.Facilities.FirstOrDefault(f => f.Name == name);
            if (existingFacility != null)
            {
                return existingFacility;
            }

            var facility = new Facility
            {
                Name = name,
                Type = type,
                Address = address,
                City = city,
                State = state,
                ZipCode = zipCode,
                Phone = phone,
                Email = email,
                Region = region,
                Coordinates = coordinates,
                IsActive = true
            };

            _context.Facilities.Add(facility);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Facility created: {Name}", facility.Name);

            return facility;
        }

        public async Task<HealthcareLocation> SeedHealthcareLocationAsync(Guid healthcareUserId, 
            string locationName, string address, string city, string state, string zipCode, 
            string phone, string facilityType, bool isPrimary)
        {
            var existingLocation = _context.HealthcareLocations
                .FirstOrDefault(l => l.HealthcareUserId == healthcareUserId && l.LocationName == locationName);
            
            if (existingLocation != null)
            {
                return existingLocation;
            }

            var location = new HealthcareLocation
            {
                HealthcareUserId = healthcareUserId,
                LocationName = locationName,
                Address = address,
                City = city,
                State = state,
                ZipCode = zipCode,
                Phone = phone,
                FacilityType = facilityType,
                IsPrimary = isPrimary,
                IsActive = true
            };

            _context.HealthcareLocations.Add(location);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Location created: {Name}", location.LocationName);

            return location;
        }
    }
}