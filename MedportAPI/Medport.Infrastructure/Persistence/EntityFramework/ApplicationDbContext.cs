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
    public DbSet<CenterUser> CenterUsers { get; set; }
    public DbSet<HealthcareUser> HealthcareUsers { get; set; }
    public DbSet<EmsUser> EmsUsers { get; set; }
    #endregion

    #region Healthcare DbSets
    public DbSet<HealthcareLocation> HealthcareLocations { get; set; }
    public DbSet<PickupLocation> PickupLocations { get; set; }
    public DbSet<HealthcareDestination> HealthcareDestinations { get; set; }
    public DbSet<HealthcareAgencyPreference> HealthcareAgencyPreferences { get; set; }
    #endregion

    #region Hospital DbSets
    public DbSet<Hospital> Hospitals { get; set; }
    #endregion

    #region EMS DbSets
    public DbSet<EmsAgency> EmsAgencies { get; set; }
    public DbSet<Unit> Units { get; set; }
    #endregion

    #region Transport DbSets
    public DbSet<TransportRequest> TransportRequests { get; set; }
    public DbSet<AgencyResponse> AgencyResponses { get; set; }
    #endregion

    #region Reference Data DbSets
    public DbSet<DropdownCategory> DropdownCategories { get; set; }
    public DbSet<DropdownOption> DropdownOptions { get; set; }
    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure entity relationships
        ConfigureUserEntities(modelBuilder);
        ConfigureHealthcareEntities(modelBuilder);
        ConfigureEmsEntities(modelBuilder);
        ConfigureTransportEntities(modelBuilder);
        ConfigureReferenceDataEntities(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }

    /// <summary>
    /// Configure relationships for user entities
    /// </summary>
    private void ConfigureUserEntities(ModelBuilder modelBuilder)
    {
        // HealthcareUser relationships
        modelBuilder.Entity<HealthcareUser>()
            .HasMany(hu => hu.Locations)
            .WithOne()
            .HasForeignKey(hl => hl.HealthcareUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HealthcareUser>()
            .HasMany(hu => hu.CreatedTransportRequests)
            .WithOne()
            .HasForeignKey(tr => tr.HealthcareCreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HealthcareUser>()
            .HasKey(hu => hu.Id);

        modelBuilder.Entity<HealthcareUser>()
            .Property(hu => hu.Email)
            .IsRequired()
            .HasMaxLength(254);

        // EmsUser relationships
        modelBuilder.Entity<EmsUser>()
            .HasOne(eu => eu.Agency)
            .WithMany()
            .HasForeignKey(eu => eu.AgencyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EmsUser>()
            .HasMany(eu => eu.AgencyResponses)
            .WithOne(ar => ar.EmsUser)
            .HasForeignKey(ar => ar.EmsUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EmsUser>()
            .HasKey(eu => eu.Id);

        modelBuilder.Entity<EmsUser>()
            .Property(eu => eu.Email)
            .IsRequired()
            .HasMaxLength(254);

        // CenterUser configuration
        modelBuilder.Entity<CenterUser>()
            .HasKey(cu => cu.Id);

        modelBuilder.Entity<CenterUser>()
            .Property(cu => cu.Email)
            .IsRequired();

        modelBuilder.Entity<CenterUser>()
            .Property(cu => cu.UserType)
            .IsRequired()
            .HasMaxLength(50);
    }

    /// <summary>
    /// Configure relationships for healthcare entities
    /// </summary>
    private void ConfigureHealthcareEntities(ModelBuilder modelBuilder)
    {
        // HealthcareLocation relationships
        modelBuilder.Entity<HealthcareLocation>()
            .HasMany(hl => hl.PickupLocations)
            .WithOne()
            .HasForeignKey(pl => pl.HospitalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HealthcareLocation>()
            .HasKey(hl => hl.Id);

        modelBuilder.Entity<HealthcareLocation>()
            .Property(hl => hl.LocationName)
            .IsRequired()
            .HasMaxLength(255);

        // PickupLocation configuration
        modelBuilder.Entity<PickupLocation>()
            .HasKey(pl => pl.Id);

        modelBuilder.Entity<PickupLocation>()
            .Property(pl => pl.Name)
            .IsRequired()
            .HasMaxLength(255);

        // HealthcareDestination configuration
        modelBuilder.Entity<HealthcareDestination>()
            .HasKey(hd => hd.Id);

        modelBuilder.Entity<HealthcareDestination>()
            .Property(hd => hd.DestinationName)
            .IsRequired()
            .HasMaxLength(255);

        modelBuilder.Entity<HealthcareDestination>()
            .HasIndex(hd => hd.HealthcareUserId);

        // HealthcareAgencyPreference configuration
        modelBuilder.Entity<HealthcareAgencyPreference>()
            .HasKey(hap => hap.Id);

        modelBuilder.Entity<HealthcareAgencyPreference>()
            .HasIndex(hap => new { hap.HealthcareUserId, hap.PreferenceOrder });
    }

    /// <summary>
    /// Configure relationships for EMS entities
    /// </summary>
    private void ConfigureEmsEntities(ModelBuilder modelBuilder)
    {
        // EmsAgency relationships
        modelBuilder.Entity<EmsAgency>()
            .HasMany(ea => ea.Units)
            .WithOne(u => u.Agency)
            .HasForeignKey(u => u.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EmsAgency>()
            .HasMany(ea => ea.AgencyResponses)
            .WithOne(ar => ar.Agency)
            .HasForeignKey(ar => ar.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EmsAgency>()
            .HasKey(ea => ea.Id);

        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.Name)
            .IsRequired()
            .HasMaxLength(255);

        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.Email)
            .HasMaxLength(254);

        // Configure JSON properties for EMS Agency
        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.OperatingHours)
            .HasColumnType("jsonb");

        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.PricingStructure)
            .HasColumnType("jsonb");

        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.AvailabilityStatus)
            .HasColumnType("jsonb");

        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.Capabilities)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        modelBuilder.Entity<EmsAgency>()
            .Property(ea => ea.ServiceArea)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        // Unit configuration
        modelBuilder.Entity<Unit>()
            .HasKey(u => u.Id);

        modelBuilder.Entity<Unit>()
            .Property(u => u.UnitNumber)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<Unit>()
            .Property(u => u.Capabilities)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(500);

        modelBuilder.Entity<Unit>()
            .Property(u => u.Equipment)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasMaxLength(1000);

        // Configure JSON property for Unit
        modelBuilder.Entity<Unit>()
            .Property(u => u.CurrentLocation)
            .HasColumnType("jsonb");

        modelBuilder.Entity<Unit>()
            .HasIndex(u => u.AgencyId);

        modelBuilder.Entity<Unit>()
            .HasIndex(u => u.Status);
    }

    /// <summary>
    /// Configure relationships for transport entities
    /// </summary>
    private void ConfigureTransportEntities(ModelBuilder modelBuilder)
    {
        // TransportRequest relationships
        modelBuilder.Entity<TransportRequest>()
            .HasMany(tr => tr.AgencyResponses)
            .WithOne(ar => ar.TransportRequest)
            .HasForeignKey(ar => ar.TransportRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TransportRequest>()
            .HasKey(tr => tr.Id);

        modelBuilder.Entity<TransportRequest>()
            .Property(tr => tr.PatientId)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<TransportRequest>()
            .Property(tr => tr.TransportLevel)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<TransportRequest>()
            .Property(tr => tr.Priority)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<TransportRequest>()
            .Property(tr => tr.Status)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<TransportRequest>()
            .HasIndex(tr => tr.Status);

        modelBuilder.Entity<TransportRequest>()
            .HasIndex(tr => tr.HealthcareCreatedById);

        modelBuilder.Entity<TransportRequest>()
            .HasIndex(tr => tr.RequestTimestamp);

        // AgencyResponse configuration
        modelBuilder.Entity<AgencyResponse>()
            .HasKey(ar => ar.Id);

        modelBuilder.Entity<AgencyResponse>()
            .Property(ar => ar.Response)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<AgencyResponse>()
            .Property(ar => ar.Status)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<AgencyResponse>()
            .HasIndex(ar => new { ar.TransportRequestId, ar.AgencyId });

        modelBuilder.Entity<AgencyResponse>()
            .HasIndex(ar => ar.AgencyId);

        modelBuilder.Entity<AgencyResponse>()
            .HasIndex(ar => ar.EmsUserId);
    }

    /// <summary>
    /// Configure relationships for reference data entities
    /// </summary>
    private void ConfigureReferenceDataEntities(ModelBuilder modelBuilder)
    {
        // DropdownCategory configuration
        modelBuilder.Entity<DropdownCategory>()
            .HasKey(dc => dc.Id);

        modelBuilder.Entity<DropdownCategory>()
            .Property(dc => dc.Slug)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<DropdownCategory>()
            .Property(dc => dc.DisplayName)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<DropdownCategory>()
            .HasMany(dc => dc.Options)
            .WithOne(do_ => do_.DropdownCategory)
            .HasForeignKey(do_ => do_.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // DropdownOption configuration
        modelBuilder.Entity<DropdownOption>()
            .HasKey(do_ => do_.Id);

        modelBuilder.Entity<DropdownOption>()
            .Property(do_ => do_.Category)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<DropdownOption>()
            .Property(do_ => do_.Value)
            .IsRequired()
            .HasMaxLength(255);

        modelBuilder.Entity<DropdownOption>()
            .HasIndex(do_ => new { do_.Category, do_.Value })
            .IsUnique();

        // Add index on Category for faster lookups
        modelBuilder.Entity<DropdownOption>()
            .HasIndex(do_ => do_.Category);
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
        int createUpdateUserId = 46;

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
                ((BaseAuditableDto)entity.Entity).CreateDate = DateTime.UtcNow;
                ((BaseAuditableDto)entity.Entity).CreateUserID = createUpdateUserId;
            }

            if (entity.State == EntityState.Modified)
            {
                ((BaseAuditableDto)entity.Entity).UpdateDate = DateTime.UtcNow;
                ((BaseAuditableDto)entity.Entity).UpdateUserID = createUpdateUserId;
            }
        }
    }
}
