using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace Medport.Domain.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Hospital> Hospitals { get; set; }

    //DbConnection GetDbConnection();

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(int createUpdateUserId, CancellationToken cancellationToken);
}
