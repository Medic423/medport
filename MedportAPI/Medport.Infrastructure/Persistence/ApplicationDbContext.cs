using MediatR;
using Medport.Domain.Common;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace Medport.Infrastructure.Persistence;

[ExcludeFromCodeCoverage]
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly IMediator _mediator;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IMediator mediator
    )
        : base(options)
    {
        _mediator = mediator;
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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

    //public DbConnection GetDbConnection()
    //{
    //    return this.Database.GetDbConnection();
    //}
}
