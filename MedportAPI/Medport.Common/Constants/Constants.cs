using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Common.Constants;

public class Constants
{
    public static class AzureFunctions
    {
        public static string AzureFunctionsAuthKeyName = "x-functions-key";
    }

    /// <summary>
    /// Authentication and security constants
    /// </summary>
    public static class Authentication
    {
        public const string AuthorizationHeader = "Authorization";
        public const string BearerScheme = "Bearer";
        public const string ContentTypeJson = "application/json";
    }

    /// <summary>
    /// HTTP status code messages
    /// </summary>
    public static class HttpMessages
    {
        public const string Unauthorized = "Unauthorized access";
        public const string Forbidden = "Access forbidden";
        public const string NotFound = "Resource not found";
        public const string BadRequest = "Invalid request";
        public const string InternalServerError = "An internal server error occurred";
        public const string Conflict = "Resource conflict";
        public const string UnprocessableEntity = "Unprocessable entity";
    }

    /// <summary>
    /// Database connection constants
    /// </summary>
    public static class Database
    {
        public const string DefaultConnection = "DefaultConnection";
        public const string HospitalConnection = "HospitalConnection";
        public const string EmsConnection = "EmsConnection";
        public const string CenterConnection = "CenterConnection";
    }

    /// <summary>
    /// Cache key prefixes
    /// </summary>
    public static class CacheKeys
    {
        public const string UserPrefix = "user_";
        public const string AgencyPrefix = "agency_";
        public const string FacilityPrefix = "facility_";
        public const string DropdownPrefix = "dropdown_";
        public const string TransportRequestPrefix = "trip_";
        public const int DefaultCacheDurationMinutes = 60;
    }

    /// <summary>
    /// Logging contexts
    /// </summary>
    public static class LoggingContexts
    {
        public const string Authentication = "Authentication";
        public const string Authorization = "Authorization";
        public const string TransportRequest = "TransportRequest";
        public const string Agency = "Agency";
        public const string User = "User";
        public const string Database = "Database";
        public const string RouteOptimization = "RouteOptimization";
    }
}
