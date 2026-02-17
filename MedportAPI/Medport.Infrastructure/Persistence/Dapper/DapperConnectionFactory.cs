using Medport.Domain.Interfaces;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Infrastructure.Persistence.Dapper;

[ExcludeFromCodeCoverage]
public class DapperConnectionFactory() : IDapperConnectionFactory
{
    private readonly string _connectionString = "TODO: ADD ME";

    public IDbConnection CreateConnection()
        => new SqlConnection(_connectionString);
}
