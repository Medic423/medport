using MediatR;
using Medport.Application.Tracc.Features.Trips.Commands.Requests;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Trips.Commands.Handlers;

public class CreateTripCommandHandler : IRequestHandler<CreateTripCommand, TransportRequestDto>
{
    private readonly IApplicationDbContext _context;

    public CreateTripCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransportRequestDto> Handle(CreateTripCommand request, CancellationToken cancellationToken)
    {
        var entity = new TransportRequest
        {
            PatientId = request.PatientId,
            OriginFacilityId = request.OriginFacilityId,
            DestinationFacilityId = request.DestinationFacilityId,
            TransportLevel = request.TransportLevel,
            Priority = request.Priority,
            SpecialRequirements = request.SpecialRequirements,
            ReadyStart = request.ReadyStart,
            ReadyEnd = request.ReadyEnd,
            HealthcareCreatedById = request.HealthcareCreatedById ?? default
        };

        _context.TransportRequests.Add(entity);
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
            ReadyEnd = entity.ReadyEnd
        };
    }
}
