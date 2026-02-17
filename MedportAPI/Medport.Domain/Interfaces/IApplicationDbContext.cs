using System.Data.Common;

namespace Medport.Domain.Interfaces;

public interface IApplicationDbContext
{
    //DbConnection GetDbConnection();

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(int createUpdateUserId, CancellationToken cancellationToken);
}
