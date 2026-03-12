using Medport.Domain.Common;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace Medport.Infrastructure.Persistence.EntityFramework;

[ExcludeFromCodeCoverage]
public class ApplicationDbContext : DbContext, IApplicationDbContext
{   
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options
    )
        : base(options)
    {
    }

    #region User DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    #endregion

    #region Organization DbSets
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<OrganizationPreference> OrganizationPreferences { get; set; }
    #endregion

    #region Facility DbSets
    public DbSet<Facility> Facilities { get; set; }
    public DbSet<PickupLocation> PickupLocations { get; set; }
    #endregion

    #region Unit DbSets
    public DbSet<Unit> Units { get; set; }
    public DbSet<UnitAnalytics> UnitAnalytics { get; set; }
    #endregion

    #region Transport DbSets
    public DbSet<TransportRequest> TransportRequests { get; set; }
    public DbSet<Trip> Trips { get; set; }
    public DbSet<AgencyResponse> AgencyResponses { get; set; }
    public DbSet<NotificationLog> NotificationLogs { get; set; }
    #endregion

    #region Analytics & Cost DbSets
    public DbSet<SystemAnalytics> SystemAnalytics { get; set; }
    public DbSet<TripCostBreakdown> TripCostBreakdowns { get; set; }
    public DbSet<CostCenter> CostCenters { get; set; }
    public DbSet<BackhaulOpportunity> BackhaulOpportunities { get; set; }
    #endregion

    #region Configuration DbSets
    public DbSet<PricingModel> PricingModels { get; set; }
    public DbSet<RouteOptimizationSettings> RouteOptimizationSettings { get; set; }
    #endregion

    #region Reference Data DbSets
    public DbSet<DropdownCategory> DropdownCategories { get; set; }
    public DbSet<DropdownOption> DropdownOptions { get; set; }
    public DbSet<CategoryDefault> CategoryDefaults { get; set; }
    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // All entity configurations are auto-discovered from IEntityTypeConfiguration<T>
        // classes in the Configurations folder
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
    }

    public async Task<int> SaveChangesAsync(int createUpdateUserId, CancellationToken cancellationToken = default)
    {
        SetCreatedAndModified(createUpdateUserId);

        var result = await base.SaveChangesAsync(cancellationToken);

        return result;
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        int createUpdateUserId = 9999;

        SetCreatedAndModified(createUpdateUserId);

        var result = await base.SaveChangesAsync(cancellationToken);

        return result;
    }

    private void SetCreatedAndModified(int createUpdateUserId)
    {
        var entities = ChangeTracker.Entries().Where(x => x.Entity is BaseAuditableDto && (x.State == EntityState.Added || x.State == EntityState.Modified));

        foreach (var entity in entities)
        {
            if (entity.State == EntityState.Added)
            {
                ((BaseAuditableDto)entity.Entity).CreatedAt = DateTime.UtcNow;
            }

            if (entity.State == EntityState.Modified)
            {
                ((BaseAuditableDto)entity.Entity).UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
