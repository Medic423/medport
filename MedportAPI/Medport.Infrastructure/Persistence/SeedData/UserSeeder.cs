using System;
using System.Threading.Tasks;
using Medport.Domain.Entities;
using Medport.Infrastructure.Security;
using Microsoft.Extensions.Logging;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Seeder for creating test users (center users, EMS users, and healthcare users).
    /// </summary>
    public class UserSeeder
    {
        private readonly MedportDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<UserSeeder> _logger;

        private const string AdminEmail = "admin@tcc.com";
        private const string RegularUserEmail = "user@tcc.com";
        private const string AdminPassword = "admin123";

        public UserSeeder(MedportDbContext context, IPasswordHasher passwordHasher, ILogger<UserSeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task SeedCenterUsersAsync()
        {
            var hashedPassword = _passwordHasher.Hash(AdminPassword);

            // Create admin user
            var existingAdmin = await _context.CenterUsers.FindAsync(AdminEmail);
            if (existingAdmin == null)
            {
                var adminUser = new CenterUser
                {
                    Email = AdminEmail,
                    Password = hashedPassword,
                    Name = "TCC Administrator",
                    UserType = "ADMIN"
                };
                _context.CenterUsers.Add(adminUser);
                _logger.LogInformation("✅ Admin user created: {Email}", adminUser.Email);
            }

            // Create regular user
            var existingUser = await _context.CenterUsers.FindAsync(RegularUserEmail);
            if (existingUser == null)
            {
                var regularUser = new CenterUser
                {
                    Email = RegularUserEmail,
                    Password = hashedPassword,
                    Name = "TCC User",
                    UserType = "USER"
                };
                _context.CenterUsers.Add(regularUser);
                _logger.LogInformation("✅ Regular user created: {Email}", regularUser.Email);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<EMSUser> SeedEMSUserAsync(string email, string password, string name, string agencyName, Guid agencyId)
        {
            var existingUser = await _context.EMSUsers.FindAsync(email);
            if (existingUser != null)
            {
                return existingUser;
            }

            var hashedPassword = _passwordHasher.Hash(password);
            var emsUser = new EMSUser
            {
                Email = email,
                Password = hashedPassword,
                Name = name,
                AgencyName = agencyName,
                AgencyId = agencyId,
                IsActive = true,
                UserType = "EMS"
            };

            _context.EMSUsers.Add(emsUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ EMS User created: {Email}", emsUser.Email);

            return emsUser;
        }

        public async Task<HealthcareUser> SeedHealthcareUserAsync(string email, string password, string name, 
            string facilityName, string facilityType, bool manageMultipleLocations = false)
        {
            var existingUser = await _context.HealthcareUsers.FindAsync(email);
            if (existingUser != null)
            {
                return existingUser;
            }

            var hashedPassword = _passwordHasher.Hash(password);
            var healthcareUser = new HealthcareUser
            {
                Email = email,
                Password = hashedPassword,
                Name = name,
                FacilityName = facilityName,
                FacilityType = facilityType,
                ManageMultipleLocations = manageMultipleLocations,
                IsActive = true
            };

            _context.HealthcareUsers.Add(healthcareUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Healthcare user created: {Email}", healthcareUser.Email);

            return healthcareUser;
        }
    }
}