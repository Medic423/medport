using System.Data;

namespace Medport.Domain.Interfaces;

public interface IDapperConnectionFactory
{
    IDbConnection CreateConnection();
}
