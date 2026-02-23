using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Medport.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Main orchestrator for database seeding operations.
    /// Coordinates seeding of all entity types in the correct dependency order.
    /// </summary>
    public class DatabaseSeeder
    {
        private readonly MedportDbContext _context;
        private readonly UserSeeder _userSeeder;
        private readonly FacilitySeeder _facilitySeeder;
        private readonly EMSAgencySeeder _emsAgencySeeder;
        private readonly DropdownSeeder _dropdownSeeder;
        private readonly PickupLocationSeeder _pickupLocationSeeder;
        private readonly TransportRequestSeeder _transportRequestSeeder;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(
            MedportDbContext context,
            UserSeeder userSeeder,
            FacilitySeeder facilitySeeder,
            EMSAgencySeeder emsAgencySeeder,
            DropdownSeeder dropdownSeeder,
            PickupLocationSeeder pickupLocationSeeder,
            TransportRequestSeeder transportRequestSeeder,
            ILogger<DatabaseSeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userSeeder = userSeeder ?? throw new ArgumentNullException(nameof(userSeeder));
            _facilitySeeder = facilitySeeder ?? throw new ArgumentNullException(nameof(facilitySeeder));
            _emsAgencySeeder = emsAgencySeeder ?? throw new ArgumentNullException(nameof(emsAgencySeeder));
            _dropdownSeeder = dropdownSeeder ?? throw new ArgumentNullException(nameof(dropdownSeeder));
            _pickupLocationSeeder = pickupLocationSeeder ?? throw new ArgumentNullException(nameof(pickupLocationSeeder));
            _transportRequestSeeder = transportRequestSeeder ?? throw new ArgumentNullException(nameof(transportRequestSeeder));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Executes all seeding operations in the correct order.
        /// </summary>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task SeedAsync()
        {
            _logger.LogInformation("?? Starting database seeding...");

            try
            {
                // Clean up existing test data (idempotent seeding)
                await CleanupTestDataAsync();

                // Seed center and EMS users
                await _userSeeder.SeedCenterUsersAsync();

                // Seed hospitals
                _logger.LogInformation("?? Creating hospitals...");
                var hospital1 = await _facilitySeeder.SeedHospitalAsync(
                    name: "Altoona Regional Health System",
                    address: "620 Howard Ave",
                    city: "Altoona",
                    state: "PA",
                    zipCode: "16601",
                    phone: "(814) 889-2011",
                    email: "info@altoonaregional.org",
                    type: "HOSPITAL",
                    capabilities: new List<string> { "EMERGENCY", "SURGERY", "ICU", "RADIOLOGY" },
                    region: "ALTOONA",
                    coordinates: new Coordinates { Latitude = 40.5187m, Longitude = -78.3947m },
                    operatingHours: "24/7"
                );

                var hospital2 = await _facilitySeeder.SeedHospitalAsync(
                    name: "UPMC Bedford",
                    address: "10455 Lincoln Hwy",
                    city: "Everett",
                    state: "PA",
                    zipCode: "15537",
                    phone: "(814) 623-3331",
                    email: "info@upmc.edu",
                    type: "HOSPITAL",
                    capabilities: new List<string> { "EMERGENCY", "SURGERY", "ICU" },
                    region: "BEDFORD",
                    coordinates: new Coordinates { Latitude = 40.0115m, Longitude = -78.3734m },
                    operatingHours: "24/7"
                );

                // Seed EMS agencies
                _logger.LogInformation("?? Creating EMS agencies...");
                var agency1 = await _emsAgencySeeder.SeedEMSAgencyAsync(
                    name: "Altoona EMS",
                    contactName: "John Smith",
                    phone: "(814) 555-0101",
                    email: "dispatch@altoonaems.com",
                    address: "123 Main St",
                    city: "Altoona",
                    state: "PA",
                    zipCode: "16601",
                    serviceArea: new List<string> { "ALTOONA", "BEDFORD" },
                    operatingHours: new OperatingHours { Start = "06:00", End = "18:00" },
                    capabilities: new List<string> { "BLS", "ALS", "CCT" },
                    pricingStructure: new PricingStructure { BaseRate = 150, PerMileRate = 2.50m }
                );

                var agency2 = await _emsAgencySeeder.SeedEMSAgencyAsync(
                    name: "Bedford Ambulance Service",
                    contactName: "Jane Doe",
                    phone: "(814) 555-0202",
                    email: "info@bedfordambulance.com",
                    address: "456 Oak Ave",
                    city: "Bedford",
                    state: "PA",
                    zipCode: "15522",
                    serviceArea: new List<string> { "BEDFORD", "ALTOONA" },
                    operatingHours: new OperatingHours { Start = "00:00", End = "23:59" },
                    capabilities: new List<string> { "BLS", "ALS" },
                    pricingStructure: new PricingStructure { BaseRate = 125, PerMileRate = 2.25m }
                );

                var agency3 = await _emsAgencySeeder.SeedEMSAgencyAsync(
                    name: "Elk County EMS",
                    contactName: "John Doer",
                    phone: "(814) 555-0303",
                    email: "doe@elkcoems.com",
                    address: "789 Main Street",
                    city: "Ridgway",
                    state: "PA",
                    zipCode: "15853",
                    serviceArea: new List<string> { "ELK COUNTY", "CAMERON COUNTY" },
                    operatingHours: new OperatingHours { Start = "00:00", End = "23:59" },
                    capabilities: new List<string> { "BLS", "ALS" },
                    pricingStructure: new PricingStructure { BaseRate = 175, PerMileRate = 2.75m }
                );

                var agency4 = await _emsAgencySeeder.SeedEMSAgencyAsync(
                    name: "Duncansville EMS",
                    contactName: "Test User",
                    phone: "(814) 555-0404",
                    email: "test@duncansvilleems.org",
                    address: "321 Pine Street",
                    city: "Duncansville",
                    state: "PA",
                    zipCode: "16635",
                    serviceArea: new List<string> { "BLAIR COUNTY", "ALTOONA" },
                    operatingHours: new OperatingHours { Start = "00:00", End = "23:59" },
                    capabilities: new List<string> { "BLS", "ALS" },
                    pricingStructure: new PricingStructure { BaseRate = 140, PerMileRate = 2.40m },
                    latitude: 40.4250m,
                    longitude: -78.4333m
                );

                // Seed EMS users
                _logger.LogInformation("?? Creating EMS users...");
                await _userSeeder.SeedEMSUserAsync("doe@elkcoems.com", "password", "John Doer", "Elk County EMS", agency3.Id);
                await _userSeeder.SeedEMSUserAsync("test@ems.com", "testpassword", "Test EMS User", "Altoona EMS", agency1.Id);
                await _userSeeder.SeedEMSUserAsync("fferguson@movalleyems.com", "movalley123", "Frank Ferguson", "Mountain Valley EMS", agency1.Id);
                await _userSeeder.SeedEMSUserAsync("test@duncansvilleems.org", "duncansville123", "Test Duncansville User", "Duncansville EMS", agency4.Id);

                // Seed facilities
                _logger.LogInformation("?? Creating facilities...");
                var facility1 = await _facilitySeeder.SeedFacilityAsync(
                    name: "Altoona Regional Emergency Department",
                    type: "HOSPITAL",
                    address: "620 Howard Ave",
                    city: "Altoona",
                    state: "PA",
                    zipCode: "16601",
                    phone: "(814) 889-2011",
                    email: "emergency@altoonaregional.org",
                    region: "Central PA",
                    coordinates: new Coordinates { Latitude = 40.5187m, Longitude = -78.3947m }
                );

                var facility2 = await _facilitySeeder.SeedFacilityAsync(
                    name: "UPMC Bedford Emergency Department",
                    type: "HOSPITAL",
                    address: "10455 Lincoln Hwy",
                    city: "Everett",
                    state: "PA",
                    zipCode: "15537",
                    phone: "(814) 623-3331",
                    email: "emergency@upmc.edu",
                    region: "Central PA",
                    coordinates: new Coordinates { Latitude = 40.0115m, Longitude = -78.3734m }
                );

                // Seed healthcare users
                _logger.LogInformation("?? Creating healthcare users...");
                var healthcareUser = await _userSeeder.SeedHealthcareUserAsync(
                    email: "nurse@altoonaregional.org",
                    password: "nurse123",
                    name: "Sarah Johnson",
                    facilityName: "Altoona Regional Health System",
                    facilityType: "HOSPITAL"
                );

                var chuckUser = await _userSeeder.SeedHealthcareUserAsync(
                    email: "chuck@ferrellhospitals.com",
                    password: "testpassword",
                    name: "Chuck Ferrell",
                    facilityName: "Ferrell Hospitals",
                    facilityType: "HOSPITAL",
                    manageMultipleLocations: true
                );

                // Seed healthcare locations
                _logger.LogInformation("?? Creating healthcare locations...");
                var chuckLocations = new List<(string Name, string Address, string City, string Zip, string Phone, bool Primary)>
                {
                    ("Penn Highlands Brookville", "100 Hospital Road", "Brookville", "15825", "(814) 849-1852", true),
                    ("Penn Highlands DuBois", "100 Hospital Avenue", "DuBois", "15801", "(814) 371-2200", false),
                    ("Penn Highlands Mon Valley", "1163 Country Club Road", "Monongahela", "15063", "(724) 258-1000", false),
                    ("Penn Highlands Clearfield", "809 Turnpike Avenue", "Clearfield", "16830", "(814) 765-5300", false),
                    ("Penn Highlands Elk", "763 Johnsonburg Road", "St. Marys", "15857", "(814) 834-4200", false),
                    ("Penn Highlands State College", "239 Colonnade Boulevard", "State College", "16803", "(814) 231-7000", false),
                    ("Penn Highlands Connellsville", "401 East Murphy Avenue", "Connellsville", "15425", "(724) 628-1500", false),
                    ("Penn Highlands Huntingdon", "1225 Warm Springs Avenue", "Huntingdon", "16652", "(814) 643-3300", false),
                    ("Penn Highlands Tyrone", "187 Hospital Drive", "Tyrone", "16686", "(814) 684-1255", false),
                };

                var chuckHealthcareLocations = new List<Medport.Domain.Entities.HealthcareLocation>();
                foreach (var (name, address, city, zip, phone, primary) in chuckLocations)
                {
                    var location = await _facilitySeeder.SeedHealthcareLocationAsync(
                        healthcareUserId: chuckUser.Id,
                        locationName: name,
                        address: address,
                        city: city,
                        state: "PA",
                        zipCode: zip,
                        phone: phone,
                        facilityType: "HOSPITAL",
                        isPrimary: primary
                    );
                    chuckHealthcareLocations.Add(location);
                }

                // Seed dropdown categories and options
                await _dropdownSeeder.SeedCategoriesAsync();
                await _dropdownSeeder.SeedOptionsAsync();

                // Seed pickup locations
                _logger.LogInformation("?? Creating pickup locations...");
                await _pickupLocationSeeder.SeedHospitalPickupLocationsAsync(hospital1);
                await _pickupLocationSeeder.SeedHospitalPickupLocationsAsync(hospital2);
                await _pickupLocationSeeder.SeedHealthcareLocationPickupLocationsAsync(chuckUser, chuckHealthcareLocations);

                // Seed transport requests
                _logger.LogInformation("?? Creating transport requests...");
                await _transportRequestSeeder.SeedSampleTransportRequestAsync(facility1, facility2, healthcareUser);

                _logger.LogInformation("?? Database seeding completed successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "? Error seeding database: {Message}", ex.Message);
                throw;
            }
        }

        private async Task CleanupTestDataAsync()
        {
            _logger.LogInformation("?? Cleaning up existing test data...");

            const string testPatientId = "PAT-001";
            const string testEmail = "chuck@ferrellhospitals.com";

            // Delete transport requests for test patient
            var transportRequests = _context.TransportRequests.Where(tr => tr.PatientId == testPatientId);
            _context.TransportRequests.RemoveRange(transportRequests);

            // Delete healthcare locations for test user
            var user = _context.HealthcareUsers.FirstOrDefault(u => u.Email == testEmail);
            if (user != null)
            {
                var locations = _context.HealthcareLocations.Where(hl => hl.HealthcareUserId == user.Id);
                _context.HealthcareLocations.RemoveRange(locations);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("? Cleanup complete");
        }
    }
}