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
    /// Seeder for creating EMS agencies.
    /// </summary>
    public class EMSAgencySeeder
    {
        private readonly MedportDbContext _context;
        private readonly ILogger<EMSAgencySeeder> _logger;

        public EMSAgencySeeder(MedportDbContext context, ILogger<EMSAgencySeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<EMSAgency> SeedEMSAgencyAsync(string name, string contactName, string phone, 
            string email, string address, string city, string state, string zipCode, 
            List<string> serviceArea, OperatingHours operatingHours, List<string> capabilities, 
            PricingStructure pricingStructure, decimal? latitude = null, decimal? longitude = null)
        {
            var existingAgency = _context.EMSAgencies.FirstOrDefault(a => a.Name == name);
            if (existingAgency != null)
            {
                return existingAgency;
            }

            var agency = new EMSAgency
            {
                Name = name,
                ContactName = contactName,
                Phone = phone,
                Email = email,
                Address = address,
                City = city,
                State = state,
                ZipCode = zipCode,
                ServiceArea = serviceArea,
                OperatingHours = operatingHours,
                Capabilities = capabilities,
                PricingStructure = pricingStructure,
                Latitude = latitude,
                Longitude = longitude,
                IsActive = true,
                Status = "ACTIVE"
            };

            _context.EMSAgencies.Add(agency);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ EMS Agency created: {Name}", agency.Name);

            return agency;
        }
    }
}