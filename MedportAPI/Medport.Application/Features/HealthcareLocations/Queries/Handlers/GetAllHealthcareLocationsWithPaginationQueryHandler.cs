using Dapper;
using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;
using Medport.Common.DTOs;
using Medport.Domain.Interfaces;
using System.Data;
using System.Text;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;

public class GetAllHealthcareLocationsWithPaginationQueryHandler(
    IDapperConnectionFactory dapperConnectionFactory
) : IRequestHandler<GetAllHealthcareLocationsWithPaginationQuery, PaginatedListDapper<HealthcareLocationDto>>
{
    private readonly IDapperConnectionFactory _dapperConnectionFactory = dapperConnectionFactory;

    public async Task<PaginatedListDapper<HealthcareLocationDto>> Handle(
        GetAllHealthcareLocationsWithPaginationQuery request,
        CancellationToken cancellationToken
    )
    {
        string sql = GetAllHealthCareLocationsQuery(request);
        string totalCountSql = GetTotalCountQuery(request);

        var test =  BuildDebugSql(sql, request);

        using IDbConnection connection = _dapperConnectionFactory.CreateConnection();

        var queryMultipleResult = await connection
                .QueryMultipleAsync(new CommandDefinition($"{sql}; {totalCountSql}", request, cancellationToken: cancellationToken));

        var healthCareLocationSearchResult = await queryMultipleResult.ReadAsync<HealthcareLocationDto>();
        var totalCount = await queryMultipleResult.ReadFirstAsync<int>();

        PaginatedListDapper<HealthcareLocationDto> paginatedHealthcareLocationSearchDto = new(
            healthCareLocationSearchResult?.ToList() ?? [],
            totalCount,
            request.Page,
            request.Limit);

        return paginatedHealthcareLocationSearchDto;
    }

    public static string BuildDebugSql(string sql, object parameters)
    {
        var sb = new StringBuilder();

        sb.AppendLine("----- SQL -----");
        sb.AppendLine(sql);
        sb.AppendLine();
        sb.AppendLine("----- PARAMETERS -----");

        if (parameters != null)
        {
            foreach (var prop in parameters.GetType().GetProperties())
            {
                var value = prop.GetValue(parameters);
                sb.AppendLine($"{prop.Name} = {value ?? "NULL"}");
            }
        }

        return sb.ToString();
    }

    private static string GetAllHealthCareLocationsQuery(GetAllHealthcareLocationsWithPaginationQuery request) 
    {
        return @$"
            SELECT 
            hl.*,
            hu.Email
            FROM HealthcareLocations hl
            LEFT JOIN HealthcareUsers hu on hu.Id = hl.HealthcareUserId
			{BuildWhereQuery(request)}
            {GetPaginationQuery(request)}
        ";
    }

    private static string BuildWhereQuery(
        GetAllHealthcareLocationsWithPaginationQuery query
    )
    {
        var filters = new List<string>();

        if (!string.IsNullOrWhiteSpace(query.LocationName))
        {
            filters.Add($"hl.LocationName LIKE '%' + @{nameof(GetAllHealthcareLocationsWithPaginationQuery.LocationName)} + '%'");
        }

        if (!string.IsNullOrWhiteSpace(query.City))
        {
            filters.Add($"hl.City LIKE '%' + @{nameof(GetAllHealthcareLocationsWithPaginationQuery.City)} + '%'");
        }

        if (!string.IsNullOrWhiteSpace(query.State))
        {
            filters.Add($"hl.State = @{nameof(GetAllHealthcareLocationsWithPaginationQuery.State)}");
        }

        if (!string.IsNullOrWhiteSpace(query.FacilityType))
        {
            filters.Add($"hl.FacilityType = @{nameof(GetAllHealthcareLocationsWithPaginationQuery.FacilityType)}");
        }

        if (query.IsActive.HasValue)
        {
            filters.Add($"hl.IsActive = @{nameof(GetAllHealthcareLocationsWithPaginationQuery.IsActive)}");
        }

        var whereClause = filters.Count != 0
            ? "WHERE " + string.Join(" AND ", filters)
            : "";

        return whereClause;
    }

    private static string GetPaginationQuery(GetAllHealthcareLocationsWithPaginationQuery request)
    {
        return @$"ORDER BY {request.OrderBy} 
		OFFSET {request.Page - 1} rows fetch next {request.Limit} rows only";
    }

    private static string GetTotalCountQuery(GetAllHealthcareLocationsWithPaginationQuery request)
    {
        return @$"SELECT COUNT(1) FROM ({GetAllHealthCareLocationsQuery(request)}) AS TotalCount";
    }

}
