using Medport.Application.Common.Common.Dtos;

namespace Medport.Application.Tracc.Features.Agencies.Queries.DTOs;

public class TransportRequestDto
{
    public Guid Id { get; set; }
    public string PatientId { get; set; }
    public FacilityDto OriginFacility { get; set; }
    public FacilityDto DestinationFacility { get; set; }
    public string TransportLevel { get; set; }
    public string Priority { get; set; }
    public string SpecialRequirements { get; set; }
    public double EstimatedDistance { get; set; }
    public int EstimatedDuration { get; set; }
    public decimal RevenuePotential { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
