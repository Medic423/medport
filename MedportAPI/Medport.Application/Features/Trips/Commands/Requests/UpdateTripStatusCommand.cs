using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.Trips.Commands.Requests;

public class UpdateTripStatusCommand : IRequest<TransportRequestDto>
{
    public Guid Id { get; set; }
    public string Status { get; set; }
    public Guid? AssignedAgencyId { get; set; }
    public Guid? AssignedUnitId { get; set; }
    public DateTime? AcceptedTimestamp { get; set; }
    public DateTime? PickupTimestamp { get; set; }
    public DateTime? ArrivalTimestamp { get; set; }
    public DateTime? DepartureTimestamp { get; set; }
    public DateTime? CompletionTimestamp { get; set; }
}
