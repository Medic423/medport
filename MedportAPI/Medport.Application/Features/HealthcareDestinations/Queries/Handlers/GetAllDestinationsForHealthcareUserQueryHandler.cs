using MediatR;
using Medport.Common.DTOs;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Requests;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Handlers;

public class GetAllDestinationsForHealthcareUserQueryHandler : IRequestHandler<GetAllDestinationsForHealthcareUserQuery, PaginatedList<HealthcareDestinationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllDestinationsForHealthcareUserQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    //public static IQueryable<HealthcareDestination> ParameterLogic(IQueryable<HealthcareDestination> query, GetAllDestinationsForHealthcareUserQuery parameters)
    //{
    //    if (!string.IsNullOrEmpty(parameters.Name))
    //    {
    //        query = query.Where(_ => !string.IsNullOrWhiteSpace(_.DestinationName) && _.DestinationName.Contains(parameters.Name, System.StringComparison.OrdinalIgnoreCase));
    //    }

    //    if (!string.IsNullOrEmpty(parameters.City))
    //    {
    //        query = query.Where(_ => !string.IsNullOrWhiteSpace(_.City) && _.City.Contains(parameters.City, System.StringComparison.OrdinalIgnoreCase));
    //    }

    //    if (!string.IsNullOrWhiteSpace(parameters.State))
    //    {
    //        query = query.Where(_ => !string.IsNullOrWhiteSpace(_.State) && _.State.Contains(parameters.State, System.StringComparison.OrdinalIgnoreCase));
    //    }

    //    if (!string.IsNullOrWhiteSpace(parameters.Type))
    //    {
    //        query = query.Where(_ => _.FacilityType == parameters.Type);
    //    }

    //    if (parameters.IsActive != null)
    //    {
    //        query = query.Where(_ => _.IsActive == parameters.IsActive);
    //    }

    //    return query;
    //}

    public async Task<PaginatedList<HealthcareDestinationDto>> Handle(GetAllDestinationsForHealthcareUserQuery request, CancellationToken cancellationToken)
    {
        return null;
        //IQueryable<HealthcareDestination> query = _context.HealthcareDestinations.AsNoTracking();

        //// Filter by owner
        //query = query.Where(h => h.HealthcareUserId == request.HealthcareUserId);

        //query = ParameterLogic(query, request);

        //var projected = query.Select(h => new HealthcareDestinationDto
        //{
        //    Id = h.Id,
        //    HealthcareUserId = h.HealthcareUserId,
        //    DestinationName = h.DestinationName,
        //    Address = h.Address,
        //    City = h.City,
        //    State = h.State,
        //    ZipCode = h.ZipCode,
        //    Phone = h.Phone,
        //    Latitude = h.Latitude,
        //    Longitude = h.Longitude,
        //    FacilityType = h.FacilityType,
        //    IsActive = h.IsActive,
        //    CreatedAt = h.CreatedAt,
        //    UpdatedAt = h.UpdatedAt
        //});

        //return await PaginatedList<HealthcareDestinationDto>.CreateAsync(projected, request.Page, request.Limit, cancellationToken);
    }
}
