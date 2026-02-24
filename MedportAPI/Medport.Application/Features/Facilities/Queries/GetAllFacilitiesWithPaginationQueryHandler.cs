using MediatR;
using Medport.Common.DTOs;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class GetAllFacilitiesWithPaginationQueryHandler : IRequestHandler<GetAllFacilitiesWithPaginationQuery, PaginatedList<FacilityDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllFacilitiesWithPaginationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public static IQueryable<HealthcareLocation> ParameterLogic(IQueryable<HealthcareLocation> query, GetAllFacilitiesWithPaginationQuery parameters)
    {
        if (!string.IsNullOrEmpty(parameters.Name))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.LocationName) && _.LocationName.Contains(parameters.Name, System.StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(parameters.City))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.City) && _.City.Contains(parameters.City, System.StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(parameters.State))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.State) && _.State.Contains(parameters.State, System.StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(parameters.Type))
        {
            query = query.Where(_ => _.FacilityType == parameters.Type);
        }

        if (parameters.IsActive != null)
        {
            query = query.Where(_ => _.IsActive == parameters.IsActive);
        }

        return query;
    }

    public async Task<PaginatedList<FacilityDto>> Handle(GetAllFacilitiesWithPaginationQuery request, CancellationToken cancellationToken)
    {
        IQueryable<HealthcareLocation> query = _context.HealthcareLocations.AsNoTracking();

        query = ParameterLogic(query, request);

        var projected = query.Select(h => new FacilityDto
        {
            Id = h.Id,
            HealthcareUserId = h.HealthcareUserId,
            LocationName = h.LocationName,
            Address = h.Address,
            City = h.City,
            State = h.State,
            ZipCode = h.ZipCode,
            Phone = h.Phone,
            FacilityType = h.FacilityType,
            IsPrimary = h.IsPrimary,
            IsActive = h.IsActive,
            Latitude = h.Latitude,
            Longitude = h.Longitude,
            CreatedAt = h.CreatedAt,
            UpdatedAt = h.UpdatedAt
        });

        return await PaginatedList<FacilityDto>.CreateAsync(projected, request.Page, request.Limit, cancellationToken);
    }
}
