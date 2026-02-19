using System.Linq.Dynamic.Core;
using System.Text;

namespace Medport.Common.Helpers;

public class DataSort<TEntity>
{
    /// <summary>
    /// Arranges data in order specified by string
    /// </summary>
    /// <param name="entity">Entity to be sorted</param>
    /// <param name="orderByQueryString">String specifying ordering</param>
    /// <returns>IQueryable with added ordering</returns>
    public IQueryable<TEntity> Sort(IQueryable<TEntity> entity, string orderByQueryString)
    {
        if (string.IsNullOrWhiteSpace(orderByQueryString))
        {
            return entity;
        }

        var orderParams = orderByQueryString.Trim().Split(',');
        var orderQueryBuilder = new StringBuilder();

        foreach (var param in orderParams)
        {
            if (string.IsNullOrWhiteSpace(param))
            {
                continue;
            }

            var propertyFromQueryName = param.Split(" ")[0];
            var objectProperty = propertyFromQueryName;

            if (objectProperty == null)
            {
                continue;
            }

            string? direction;

            if (orderParams.Length > 1 && orderParams[orderParams.Length - 1] != param)
            {

                direction = param.ToLower().EndsWith(" desc") ? "descending, " : param.ToLower().EndsWith(" asc") ? "ascending, " : "";
                orderQueryBuilder.Append($"{objectProperty} {direction}");
                continue;
            }

            direction = param.ToLower().EndsWith(" desc") ? "descending" : param.ToLower().EndsWith(" asc") ? "ascending" : "";
            orderQueryBuilder.Append($"{objectProperty} {direction}");
        }

        var orderQuery = orderQueryBuilder.ToString();

        if (string.IsNullOrWhiteSpace(orderQuery))
        {
            return entity;
        }

        return entity.OrderBy(orderQuery);
    }
}
