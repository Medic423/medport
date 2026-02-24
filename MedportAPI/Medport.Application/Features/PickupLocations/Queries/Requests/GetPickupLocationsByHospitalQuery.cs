using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using System.Collections.Generic;
using System;

namespace Medport.Application.Tracc.Features.PickupLocations.Queries.Requests;

public class GetPickupLocationsByHospitalQuery : IRequest<IEnumerable<PickupLocationDto>>
{
    public Guid HospitalId { get; set; }
    public bool IncludeInactive { get; set; } = false;
}
