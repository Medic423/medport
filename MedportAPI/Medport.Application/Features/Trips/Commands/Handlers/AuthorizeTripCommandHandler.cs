using MediatR;
using Medport.Application.Tracc.Features.Trips.Commands.Requests;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Trips.Commands.Handlers;

public class AuthorizeTripCommandHandler : IRequestHandler<AuthorizeTripCommand, TransportRequestDto>
{
    private readonly IApplicationDbContext _context;

    public AuthorizeTripCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransportRequestDto> Handle(AuthorizeTripCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TransportRequests.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (entity == null) return null;

        // Set the ready window start to the authorized time and mark as pending dispatch
        entity.ReadyStart = request.AuthorizedTime;
        entity.Status = "PENDING_DISPATCH";
        entity.UpdatedAt = System.DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new TransportRequestDto
        {
            Id = entity.Id,
            PatientId = entity.PatientId,
            OriginFacilityId = entity.OriginFacilityId,
            DestinationFacilityId = entity.DestinationFacilityId,
            TransportLevel = entity.TransportLevel,
            Priority = entity.Priority,
            Status = entity.Status,
            SpecialRequirements = entity.SpecialRequirements,
            RequestTimestamp = entity.RequestTimestamp,
            ReadyStart = entity.ReadyStart,
            ReadyEnd = entity.ReadyEnd,
            AssignedAgencyId = entity.AssignedAgencyId,
            AssignedUnitId = entity.AssignedUnitId,
            AcceptedTimestamp = entity.AcceptedTimestamp,
            PickupTimestamp = entity.PickupTimestamp,
            CompletionTimestamp = entity.CompletionTimestamp
        };
    }
}
