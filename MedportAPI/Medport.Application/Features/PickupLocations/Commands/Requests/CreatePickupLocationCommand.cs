using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;

public class CreatePickupLocationCommand : IRequest<PickupLocationDto>
{
    public Guid HospitalId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string ContactPhone { get; set; }
    public string ContactEmail { get; set; }
    public string Floor { get; set; }
    public string Room { get; set; }
}
