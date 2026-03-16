using MediatR;
using Medport.Common.DTOs;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Application.Common.Common.Dtos;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class GetAllFacilitiesWithPaginationQueryHandler(IApplicationDbContext context) : 
    IRequestHandler<GetAllFacilitiesWithPaginationQuery, PaginatedList<FacilityDto>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<PaginatedList<FacilityDto>> Handle(
        GetAllFacilitiesWithPaginationQuery request, 
        CancellationToken cancellationToken
    )
    {
        IQueryable<Facility> query = _context.Facilities.AsNoTracking();

        query = ParameterLogic(query, request);

        var projected = query.Select(h => new FacilityDto
        {
            Id = h.Id,
            Name = h.Name,
            Address = h.Address,
            City = h.City,
            State = h.State,
            ZipCode = h.ZipCode,
            Phone = h.Phone,
            Email = h.Email,
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

    public static IQueryable<Facility> ParameterLogic(
        IQueryable<Facility> query, 
        GetAllFacilitiesWithPaginationQuery parameters
    )
    {
        if (!string.IsNullOrEmpty(parameters.Name))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.Name) &&
            _.Name.Contains(parameters.Name, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(parameters.City))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.City) &&
            _.City.Contains(parameters.City, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(parameters.State))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.State) &&
            _.State.Contains(parameters.State, StringComparison.OrdinalIgnoreCase));
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
}
