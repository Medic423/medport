using System;
using System.Collections.Generic;

namespace Medport.Domain
{
    /// <summary>
    /// Domain constants for the Medport application.
    /// Maps to Node.js backend constants for consistency across platforms.
    /// </summary>
    public static class Constants
    {
        /// <summary>
        /// User role types
        /// </summary>
        public static class UserTypes
        {
            public const string Admin = "ADMIN";
            public const string User = "USER";
            public const string Healthcare = "HEALTHCARE";
            public const string Ems = "EMS";
        }

        /// <summary>
        /// Transport service levels
        /// </summary>
        public static class TransportLevels
        {
            public const string BLS = "BLS";
            public const string ALS = "ALS";
            public const string CCT = "CCT";

            public static readonly List<string> All = new List<string> { BLS, ALS, CCT };

            public static bool IsValid(string level) => All.Contains(level);
        }

        /// <summary>
        /// Trip priority levels
        /// </summary>
        public static class TripPriorities
        {
            public const string Low = "LOW";
            public const string Medium = "MEDIUM";
            public const string High = "HIGH";
            public const string Urgent = "URGENT";

            public static readonly List<string> All = new List<string> { Low, Medium, High, Urgent };

            public static bool IsValid(string priority) => All.Contains(priority);
        }

        /// <summary>
        /// Transport request statuses
        /// </summary>
        public static class TripStatuses
        {
            public const string Pending = "PENDING";
            public const string Accepted = "ACCEPTED";
            public const string InProgress = "IN_PROGRESS";
            public const string Completed = "COMPLETED";
            public const string Cancelled = "CANCELLED";

            public static readonly List<string> All = new List<string> { Pending, Accepted, InProgress, Completed, Cancelled };

            public static bool IsValid(string status) => All.Contains(status);
        }

        /// <summary>
        /// Agency response statuses
        /// </summary>
        public static class AgencyResponseStatuses
        {
            public const string Accepted = "ACCEPTED";
            public const string Declined = "DECLINED";
            public const string Pending = "PENDING";

            public static readonly List<string> All = new List<string> { Accepted, Declined, Pending };

            public static bool IsValid(string status) => All.Contains(status);
        }

        /// <summary>
        /// Unit statuses
        /// </summary>
        public static class UnitStatuses
        {
            public const string Available = "AVAILABLE";
            public const string Committed = "COMMITTED";
            public const string OutOfService = "OUT_OF_SERVICE";
            public const string Maintenance = "MAINTENANCE";
            public const string OffDuty = "OFF_DUTY";
            public const string OnCall = "ON_CALL";

            public static readonly List<string> All = new List<string> 
            { 
                Available, Committed, OutOfService, Maintenance, OffDuty, OnCall 
            };

            public static bool IsValid(string status) => All.Contains(status);
        }

        /// <summary>
        /// Facility types
        /// </summary>
        public static class FacilityTypes
        {
            public const string Hospital = "HOSPITAL";
            public const string Clinic = "CLINIC";
            public const string UrgentCare = "URGENT_CARE";
            public const string RehabilitationFacility = "REHABILITATION_FACILITY";
            public const string DoctorsOffice = "DOCTOR'S_OFFICE";
            public const string DialysisCenter = "DIALYSIS_CENTER";
            public const string NursingHome = "NURSING_HOME";
            public const string AssistedLiving = "ASSISTED_LIVING";
            public const string Other = "OTHER";

            public static readonly List<string> All = new List<string>
            {
                Hospital, Clinic, UrgentCare, RehabilitationFacility, 
                DoctorsOffice, DialysisCenter, NursingHome, AssistedLiving, Other
            };

            public static bool IsValid(string type) => All.Contains(type);
        }

        /// <summary>
        /// Dropdown categories (fixed slugs - cannot be changed)
        /// Maps to Node.js backend dropdown-1 through dropdown-7
        /// </summary>
        public static class DropdownCategories
        {
            public const string TransportLevels = "dropdown-1";
            public const string UrgencyLevels = "dropdown-2";
            public const string PrimaryDiagnosis = "dropdown-3";
            public const string MobilityLevels = "dropdown-4";
            public const string InsuranceCompanies = "dropdown-5";
            public const string SecondaryInsurance = "dropdown-6";
            public const string SpecialNeeds = "dropdown-7";

            public static readonly Dictionary<string, string> CategoryNames = new Dictionary<string, string>
            {
                { TransportLevels, "Transport Levels" },
                { UrgencyLevels, "Urgency Levels" },
                { PrimaryDiagnosis, "Primary Diagnosis" },
                { MobilityLevels, "Mobility Levels" },
                { InsuranceCompanies, "Insurance Companies" },
                { SecondaryInsurance, "Secondary Insurance" },
                { SpecialNeeds, "Special Needs" }
            };

            public static bool IsValid(string slug) => CategoryNames.ContainsKey(slug);

            public static string GetDisplayName(string slug) => 
                CategoryNames.TryGetValue(slug, out var name) ? name : slug;
        }

        /// <summary>
        /// EMS Unit types
        /// </summary>
        public static class UnitTypes
        {
            public const string Ambulance = "AMBULANCE";
            public const string Helicopter = "HELICOPTER";
            public const string FireTruck = "FIRE_TRUCK";
            public const string RescueVehicle = "RESCUE_VEHICLE";

            public static readonly List<string> All = new List<string>
            {
                Ambulance, Helicopter, FireTruck, RescueVehicle
            };

            public static bool IsValid(string type) => All.Contains(type);
        }

        /// <summary>
        /// Agency statuses
        /// </summary>
        public static class AgencyStatuses
        {
            public const string Active = "ACTIVE";
            public const string Inactive = "INACTIVE";
            public const string PendingReview = "PENDING_REVIEW";

            public static readonly List<string> All = new List<string>
            {
                Active, Inactive, PendingReview
            };

            public static bool IsValid(string status) => All.Contains(status);
        }

        /// <summary>
        /// EMS Unit capabilities
        /// </summary>
        public static class UnitCapabilities
        {
            public const string BLS = "BLS";
            public const string ALS = "ALS";
            public const string CCT = "CCT";
            public const string CriticalCare = "Critical Care";
            public const string Neonatal = "Neonatal";
            public const string Pediatric = "Pediatric";
            public const string Bariatric = "Bariatric";
            public const string Isolation = "Isolation";

            public static readonly List<string> All = new List<string>
            {
                BLS, ALS, CCT, CriticalCare, Neonatal, Pediatric, Bariatric, Isolation
            };

            public static bool IsValid(string capability) => All.Contains(capability);
        }

        /// <summary>
        /// Patient age types
        /// </summary>
        public static class PatientAgeTypes
        {
            public const string Years = "YEARS";
            public const string Months = "MONTHS";
            public const string Weeks = "WEEKS";
            public const string Days = "DAYS";

            public static readonly List<string> All = new List<string>
            {
                Years, Months, Weeks, Days
            };

            public static bool IsValid(string ageType) => All.Contains(ageType);
        }

        /// <summary>
        /// API response codes and messages
        /// </summary>
        public static class ApiResponses
        {
            public const string SuccessCode = "SUCCESS";
            public const string ErrorCode = "ERROR";
            public const string ValidationErrorCode = "VALIDATION_ERROR";
            public const string NotFoundCode = "NOT_FOUND";
            public const string UnauthorizedCode = "UNAUTHORIZED";
            public const string ForbiddenCode = "FORBIDDEN";
        }

        /// <summary>
        /// Backhaul detection constants
        /// </summary>
        public static class BackhaulDetection
        {
            /// <summary>
            /// Maximum time window for valid backhaul pair in minutes (90 minutes)
            /// </summary>
            public const int MaxTimeWindowMinutes = 90;

            /// <summary>
            /// Maximum distance radius for valid backhaul pair in miles (15 miles)
            /// </summary>
            public const double MaxDistanceRadiusMiles = 15.0;

            /// <summary>
            /// Minimum revenue bonus for backhaul pairing
            /// </summary>
            public const double MinimumRevenueBonus = 25.0;
        }

        /// <summary>
        /// Route optimization settings
        /// </summary>
        public static class RouteOptimization
        {
            /// <summary>
            /// Deadhead miles penalty per mile
            /// </summary>
            public const double DeadheadMilesPenalty = 0.5;

            /// <summary>
            /// Wait time penalty per minute
            /// </summary>
            public const double WaitTimePenalty = 0.1;

            /// <summary>
            /// Backhaul bonus amount
            /// </summary>
            public const double BackhaulBonus = 25.0;

            /// <summary>
            /// Overtime risk penalty per hour
            /// </summary>
            public const double OvertimeRiskPenalty = 2.0;

            /// <summary>
            /// Average speed in mph for time calculations
            /// </summary>
            public const int AverageSpeedMph = 30;

            /// <summary>
            /// Standard service time in minutes (pickup and delivery)
            /// </summary>
            public const int StandardServiceTimeMinutes = 15;
        }

        /// <summary>
        /// Validation constraints
        /// </summary>
        public static class ValidationConstraints
        {
            /// <summary>
            /// Maximum email length
            /// </summary>
            public const int MaxEmailLength = 254;

            /// <summary>
            /// Maximum name length
            /// </summary>
            public const int MaxNameLength = 255;

            /// <summary>
            /// Maximum address length
            /// </summary>
            public const int MaxAddressLength = 255;

            /// <summary>
            /// Maximum phone length
            /// </summary>
            public const int MaxPhoneLength = 20;

            /// <summary>
            /// Minimum password length
            /// </summary>
            public const int MinPasswordLength = 8;

            /// <summary>
            /// Maximum password length
            /// </summary>
            public const int MaxPasswordLength = 128;

            /// <summary>
            /// ZIP code length
            /// </summary>
            public const int ZipCodeLength = 5;
        }

        /// <summary>
        /// Time-related constants
        /// </summary>
        public static class TimeConstants
        {
            /// <summary>
            /// JWT token expiration in hours
            /// </summary>
            public const int JwtExpirationHours = 24;

            /// <summary>
            /// Password reset token expiration in minutes
            /// </summary>
            public const int PasswordResetTokenExpirationMinutes = 60;

            /// <summary>
            /// Email verification token expiration in minutes
            /// </summary>
            public const int EmailVerificationTokenExpirationMinutes = 1440; // 24 hours
        }

        /// <summary>
        /// Unit Management Constants
        /// </summary>
        public static class UnitManagement
        {
            public static class Messages
            {
                public const string SavedSuccesfully = "Unit created successfully";
                public const string UpdatedSuccesfully = "Unit updated successfully";
                public const string DeletedSuccesfully = "Unit deleted successfully";
                public const string StatusUpdatedSuccesfully = "Unit status updated successfully";
                public const string UnitNotFound = "Unit not found";
                public const string AgencyNotFound = "Agency not found";
                public const string InvalidUnitData = "Invalid unit data provided";
            }
        }
    }
}