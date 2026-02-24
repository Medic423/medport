using MediatR;

namespace Medport.Application.Tracc.Features.Public.Queries.Requests;

public class GeocodeAddressCommand : IRequest<Medport.Application.Tracc.Features.Public.Queries.Dtos.GeocodeResultDto>
{
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string FacilityName { get; set; }
}
