using Medport.Domain.Interfaces;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Infrastructure.Persistence.Dapper;

[ExcludeFromCodeCoverage]
public class DapperConnectionFactory() : IDapperConnectionFactory
{
    //TODO Move
    private readonly string _connectionString = "Server=tcp:traccems-dbserver-dev.database.windows.net,1433;Initial Catalog=traccems-db-dev;Persist Security Info=False;User ID=traccemsadmin;Password=rFWzcx2Y2bs8ugh;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30;";

    public IDbConnection CreateConnection()
        => new SqlConnection(_connectionString);
}
