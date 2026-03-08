using MediatR;
using Medport.Application.Tracc.Features.Public.Queries.Dtos;
using Medport.Application.Tracc.Features.Public.Queries.Handlers;

namespace Medport.Application.Tracc.Features.Public.Queries.Requests;

/// <summary>
/// See <see cref="GeocodeAddressCommandHandler"/>
/// </summary>

public class GeocodeAddressCommand : IRequest<GeocodeResultDto>
{
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string FacilityName { get; set; }
}
