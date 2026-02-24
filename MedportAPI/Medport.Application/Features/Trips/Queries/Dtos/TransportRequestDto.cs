using System;

namespace Medport.Application.Tracc.Features.Trips.Queries.Dtos;

public class TransportRequestDto
{
    public Guid Id { get; set; }
    public string PatientId { get; set; }
    public Guid OriginFacilityId { get; set; }
    public Guid DestinationFacilityId { get; set; }
    public string TransportLevel { get; set; }
    public string Priority { get; set; }
    public string Status { get; set; }
    public string SpecialRequirements { get; set; }
    public DateTime RequestTimestamp { get; set; }
    public DateTime? ReadyStart { get; set; }
    public DateTime? ReadyEnd { get; set; }
    public Guid? AssignedAgencyId { get; set; }
    public Guid? AssignedUnitId { get; set; }
    public DateTime? AcceptedTimestamp { get; set; }
    public DateTime? PickupTimestamp { get; set; }
    public DateTime? CompletionTimestamp { get; set; }
}
