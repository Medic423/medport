using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Medport.Domain.Interfaces;

public interface IApplicationDbContext
{

    #region User DbSets
    DbSet<User> Users { get; set; }
    DbSet<UserPreference> UserPreferences { get; set; }
    DbSet<Role> Roles { get; set; }
    DbSet<UserRole> UserRoles { get; set; }
    #endregion

    #region Organization DbSets
    DbSet<Organization> Organizations { get; set; }
    DbSet<OrganizationPreference> OrganizationPreferences { get; set; }
    #endregion

    #region Facility DbSets
    DbSet<Facility> Facilities { get; set; }
    DbSet<PickupLocation> PickupLocations { get; set; }
    #endregion

    #region Unit DbSets
    DbSet<Unit> Units { get; set; }
    DbSet<UnitAnalytics> UnitAnalytics { get; set; }
    #endregion

    #region Transport DbSets
    DbSet<TransportRequest> TransportRequests { get; set; }
    DbSet<Trip> Trips { get; set; }
    DbSet<AgencyResponse> AgencyResponses { get; set; }
    DbSet<NotificationLog> NotificationLogs { get; set; }
    #endregion

    #region Analytics & Cost DbSets
    DbSet<SystemAnalytics> SystemAnalytics { get; set; }
    DbSet<TripCostBreakdown> TripCostBreakdowns { get; set; }
    DbSet<CostCenter> CostCenters { get; set; }
    DbSet<BackhaulOpportunity> BackhaulOpportunities { get; set; }
    #endregion

    #region Configuration DbSets
    DbSet<PricingModel> PricingModels { get; set; }
    DbSet<RouteOptimizationSettings> RouteOptimizationSettings { get; set; }
    #endregion

    #region Reference Data DbSets
    DbSet<DropdownCategory> DropdownCategories { get; set; }
    DbSet<DropdownOption> DropdownOptions { get; set; }
    DbSet<CategoryDefault> CategoryDefaults { get; set; }
    #endregion

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(int createUpdateUserId, CancellationToken cancellationToken);
}
