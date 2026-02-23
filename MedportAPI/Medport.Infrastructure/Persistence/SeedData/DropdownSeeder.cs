using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Medport.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Seeder for creating dropdown categories and options.
    /// </summary>
    public class DropdownSeeder
    {
        private readonly MedportDbContext _context;
        private readonly ILogger<DropdownSeeder> _logger;

        private static class DropdownCategories
        {
            public const string TransportLevels = "dropdown-1";
            public const string UrgencyLevels = "dropdown-2";
            public const string PrimaryDiagnosis = "dropdown-3";
            public const string MobilityLevels = "dropdown-4";
            public const string InsuranceCompanies = "dropdown-5";
            public const string SecondaryInsurance = "dropdown-6";
            public const string SpecialNeeds = "dropdown-7";
        }

        public DropdownSeeder(MedportDbContext context, ILogger<DropdownSeeder> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task SeedCategoriesAsync()
        {
            var categories = new List<DropdownCategory>
            {
                new() { Slug = DropdownCategories.TransportLevels, DisplayName = "Transport Levels", DisplayOrder = 1 },
                new() { Slug = DropdownCategories.UrgencyLevels, DisplayName = "Urgency Levels", DisplayOrder = 2 },
                new() { Slug = DropdownCategories.PrimaryDiagnosis, DisplayName = "Primary Diagnosis", DisplayOrder = 3 },
                new() { Slug = DropdownCategories.MobilityLevels, DisplayName = "Mobility Levels", DisplayOrder = 4 },
                new() { Slug = DropdownCategories.InsuranceCompanies, DisplayName = "Insurance Companies", DisplayOrder = 5 },
                new() { Slug = DropdownCategories.SecondaryInsurance, DisplayName = "Secondary Insurance", DisplayOrder = 6 },
                new() { Slug = DropdownCategories.SpecialNeeds, DisplayName = "Special Needs", DisplayOrder = 7 },
            };

            foreach (var category in categories)
            {
                var existingCategory = await _context.DropdownCategories.FindAsync(category.Slug);
                if (existingCategory == null)
                {
                    _context.DropdownCategories.Add(category);
                }
                else
                {
                    existingCategory.DisplayName = category.DisplayName;
                    existingCategory.DisplayOrder = category.DisplayOrder;
                    existingCategory.IsActive = true;
                    _context.DropdownCategories.Update(existingCategory);
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Categories seeded: {Count}", categories.Count);
        }

        public async Task SeedOptionsAsync()
        {
            var options = new List<(string Category, string Value)>
            {
                // Insurance (dropdown-5)
                (DropdownCategories.InsuranceCompanies, "Medicare"),
                (DropdownCategories.InsuranceCompanies, "Medicaid"),
                (DropdownCategories.InsuranceCompanies, "Aetna"),
                (DropdownCategories.InsuranceCompanies, "Anthem Blue Cross Blue Shield"),
                (DropdownCategories.InsuranceCompanies, "Blue Cross Blue Shield"),
                (DropdownCategories.InsuranceCompanies, "Cigna"),
                (DropdownCategories.InsuranceCompanies, "Humana"),
                (DropdownCategories.InsuranceCompanies, "UnitedHealthcare"),
                (DropdownCategories.InsuranceCompanies, "Private"),
                (DropdownCategories.InsuranceCompanies, "Self-pay"),
                (DropdownCategories.InsuranceCompanies, "Other"),

                // Diagnosis (dropdown-3)
                (DropdownCategories.PrimaryDiagnosis, "Cardiac"),
                (DropdownCategories.PrimaryDiagnosis, "Respiratory"),
                (DropdownCategories.PrimaryDiagnosis, "Neurological"),
                (DropdownCategories.PrimaryDiagnosis, "Trauma"),
                (DropdownCategories.PrimaryDiagnosis, "Acute Myocardial Infarction"),
                (DropdownCategories.PrimaryDiagnosis, "Stroke/CVA"),
                (DropdownCategories.PrimaryDiagnosis, "Pneumonia"),
                (DropdownCategories.PrimaryDiagnosis, "Congestive Heart Failure"),
                (DropdownCategories.PrimaryDiagnosis, "COPD Exacerbation"),
                (DropdownCategories.PrimaryDiagnosis, "Sepsis"),
                (DropdownCategories.PrimaryDiagnosis, "Surgical Recovery"),
                (DropdownCategories.PrimaryDiagnosis, "Dialysis"),
                (DropdownCategories.PrimaryDiagnosis, "Oncology"),
                (DropdownCategories.PrimaryDiagnosis, "Psychiatric Emergency"),
                (DropdownCategories.PrimaryDiagnosis, "Other"),

                // Mobility (dropdown-4)
                (DropdownCategories.MobilityLevels, "Ambulatory"),
                (DropdownCategories.MobilityLevels, "Wheelchair"),
                (DropdownCategories.MobilityLevels, "Stretcher"),
                (DropdownCategories.MobilityLevels, "Bed-bound"),
                (DropdownCategories.MobilityLevels, "Independent"),
                (DropdownCategories.MobilityLevels, "Assistive Device Required"),
                (DropdownCategories.MobilityLevels, "Wheelchair Bound"),
                (DropdownCategories.MobilityLevels, "Bed Bound"),
                (DropdownCategories.MobilityLevels, "Stretcher Required"),
                (DropdownCategories.MobilityLevels, "Bariatric Equipment Required"),

                // Transport Level (dropdown-1)
                (DropdownCategories.TransportLevels, "BLS"),
                (DropdownCategories.TransportLevels, "ALS"),
                (DropdownCategories.TransportLevels, "CCT"),
                (DropdownCategories.TransportLevels, "BLS - Basic Life Support"),
                (DropdownCategories.TransportLevels, "ALS - Advanced Life Support"),
                (DropdownCategories.TransportLevels, "Critical Care"),
                (DropdownCategories.TransportLevels, "Neonatal"),
                (DropdownCategories.TransportLevels, "Bariatric"),
                (DropdownCategories.TransportLevels, "Non-Emergency"),
                (DropdownCategories.TransportLevels, "Other"),

                // Urgency (dropdown-2)
                (DropdownCategories.UrgencyLevels, "Routine"),
                (DropdownCategories.UrgencyLevels, "Urgent"),
                (DropdownCategories.UrgencyLevels, "Emergent"),
                (DropdownCategories.UrgencyLevels, "Emergency"),
                (DropdownCategories.UrgencyLevels, "Scheduled"),
                (DropdownCategories.UrgencyLevels, "Discharge"),

                // Special Needs (dropdown-7)
                (DropdownCategories.SpecialNeeds, "Bariatric Stretcher"),
                (DropdownCategories.SpecialNeeds, "Oxygen Required"),
                (DropdownCategories.SpecialNeeds, "Monitoring Required"),
                (DropdownCategories.SpecialNeeds, "Ventilator Required"),
            };

            var processedCount = 0;
            foreach (var (category, value) in options)
            {
                var existingOption = _context.DropdownOptions
                    .FirstOrDefault(o => o.Category == category && o.Value == value);

                if (existingOption == null)
                {
                    var categoryEntity = await _context.DropdownCategories.FindAsync(category);
                    var option = new DropdownOption
                    {
                        Category = category,
                        CategoryId = categoryEntity?.Id,
                        Value = value,
                        IsActive = true
                    };
                    _context.DropdownOptions.Add(option);
                }
                else
                {
                    existingOption.IsActive = true;
                    _context.DropdownOptions.Update(existingOption);
                }

                processedCount++;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ {Count} dropdown options created/updated", processedCount);
        }
    }
}