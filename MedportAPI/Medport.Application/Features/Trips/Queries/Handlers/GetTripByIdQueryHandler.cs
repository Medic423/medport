using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Requests;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Trips.Queries.Handlers;

public class GetTripByIdQueryHandler : IRequestHandler<GetTripByIdQuery, TransportRequestDto>
{
    private readonly IApplicationDbContext _context;

    public GetTripByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransportRequestDto> Handle(GetTripByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _context.TransportRequests.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (t == null) return null;

        return new TransportRequestDto
        {
            Id = t.Id,
            PatientId = t.PatientId,
            OriginFacilityId = t.OriginFacilityId,
            DestinationFacilityId = t.DestinationFacilityId,
            TransportLevel = t.TransportLevel,
            Priority = t.Priority,
            Status = t.Status,
            SpecialRequirements = t.SpecialRequirements,
            RequestTimestamp = t.RequestTimestamp,
            ReadyStart = t.ReadyStart,
            ReadyEnd = t.ReadyEnd,
            AssignedAgencyId = t.AssignedAgencyId,
            AssignedUnitId = t.AssignedUnitId,
            AcceptedTimestamp = t.AcceptedTimestamp,
            PickupTimestamp = t.PickupTimestamp,
            CompletionTimestamp = t.CompletionTimestamp
        };
    }
}
