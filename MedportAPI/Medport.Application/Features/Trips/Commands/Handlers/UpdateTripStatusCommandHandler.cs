using MediatR;
using Medport.Application.Tracc.Features.Trips.Commands.Requests;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Trips.Commands.Handlers;

public class UpdateTripStatusCommandHandler : IRequestHandler<UpdateTripStatusCommand, TransportRequestDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateTripStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransportRequestDto> Handle(UpdateTripStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TransportRequests.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (entity == null) return null;

        entity.Status = request.Status ?? entity.Status;
        entity.AssignedAgencyId = request.AssignedAgencyId ?? entity.AssignedAgencyId;
        entity.AssignedUnitId = request.AssignedUnitId ?? entity.AssignedUnitId;
        entity.AcceptedTimestamp = request.AcceptedTimestamp ?? entity.AcceptedTimestamp;
        entity.PickupTimestamp = request.PickupTimestamp ?? entity.PickupTimestamp;
        entity.CompletionTimestamp = request.CompletionTimestamp ?? entity.CompletionTimestamp;
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
