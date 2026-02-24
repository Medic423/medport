using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.Trips.Commands.Requests;

public class CreateTripCommand : IRequest<TransportRequestDto>
{
    public string PatientId { get; set; }
    public Guid OriginFacilityId { get; set; }
    public Guid DestinationFacilityId { get; set; }
    public string TransportLevel { get; set; }
    public string Priority { get; set; }
    public string SpecialRequirements { get; set; }
    public DateTime? ReadyStart { get; set; }
    public DateTime? ReadyEnd { get; set; }
    public Guid? PickupLocationId { get; set; }
    public Guid? HealthcareCreatedById { get; set; }
}
