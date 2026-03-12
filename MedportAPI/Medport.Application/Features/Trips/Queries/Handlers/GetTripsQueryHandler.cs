using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Requests;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Trips.Queries.Handlers;

public class GetTripsQueryHandler : IRequestHandler<GetTripsQuery, IEnumerable<TransportRequestDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTripsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TransportRequestDto>> Handle(GetTripsQuery request, CancellationToken cancellationToken)
    {
        //var query = _context.TransportRequests.AsNoTracking().AsQueryable();

        //if (!string.IsNullOrWhiteSpace(request.Status)) query = query.Where(t => t.Status == request.Status);
        //if (!string.IsNullOrWhiteSpace(request.TransportLevel)) query = query.Where(t => t.TransportLevel == request.TransportLevel);
        //if (!string.IsNullOrWhiteSpace(request.Priority)) query = query.Where(t => t.Priority == request.Priority);
        //if (!string.IsNullOrWhiteSpace(request.AgencyId)) query = query.Where(t => t.AssignedAgencyId != null && t.AssignedAgencyId.ToString() == request.AgencyId);
        //if (!string.IsNullOrWhiteSpace(request.HealthcareUserId)) query = query.Where(t => t.HealthcareCreatedById.ToString() == request.HealthcareUserId);

        //var list = await query.OrderByDescending(t => t.RequestTimestamp).Select(t => new TransportRequestDto
        //{
        //    Id = t.Id,
        //    PatientId = t.PatientId,
        //    OriginFacilityId = t.OriginFacilityId,
        //    DestinationFacilityId = t.DestinationFacilityId,
        //    TransportLevel = t.TransportLevel,
        //    Priority = t.Priority,
        //    Status = t.Status,
        //    SpecialRequirements = t.SpecialRequirements,
        //    RequestTimestamp = t.RequestTimestamp,
        //    ReadyStart = t.ReadyStart,
        //    ReadyEnd = t.ReadyEnd,
        //    AssignedAgencyId = t.AssignedAgencyId,
        //    AssignedUnitId = t.AssignedUnitId,
        //    AcceptedTimestamp = t.AcceptedTimestamp,
        //    PickupTimestamp = t.PickupTimestamp,
        //    CompletionTimestamp = t.CompletionTimestamp
        //}).ToListAsync(cancellationToken);

        //return list;

        return null;
    }
}
