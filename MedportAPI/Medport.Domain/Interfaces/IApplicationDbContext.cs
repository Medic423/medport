using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Medport.Domain.Interfaces;

public interface IApplicationDbContext
{

    #region User DbSets
    DbSet<CenterUser> CenterUsers { get; set; }
    DbSet<HealthcareUser> HealthcareUsers { get; set; }
    DbSet<EmsUser> EmsUsers { get; set; }
    #endregion

    #region Healthcare DbSets
    DbSet<HealthcareLocation> HealthcareLocations { get; set; }
    DbSet<PickupLocation> PickupLocations { get; set; }
    DbSet<HealthcareDestination> HealthcareDestinations { get; set; }
    DbSet<HealthcareAgencyPreference> HealthcareAgencyPreferences { get; set; }
    #endregion

    #region Hospital DbSets
    DbSet<Hospital> Hospitals { get; set; }
    #endregion

    #region EMS DbSets
    DbSet<EmsAgency> EmsAgencies { get; set; }
    DbSet<Unit> Units { get; set; }
    #endregion

    #region Transport DbSets
    DbSet<TransportRequest> TransportRequests { get; set; }
    DbSet<AgencyResponse> AgencyResponses { get; set; }
    #endregion

    #region Reference Data DbSets
    DbSet<DropdownCategory> DropdownCategories { get; set; }
    DbSet<DropdownOption> DropdownOptions { get; set; }
    #endregion

    //DbConnection GetDbConnection();

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(int createUpdateUserId, CancellationToken cancellationToken);
}
