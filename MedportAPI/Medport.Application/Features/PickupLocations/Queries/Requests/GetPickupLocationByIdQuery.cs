using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.PickupLocations.Queries.Requests;

public record GetPickupLocationByIdQuery(Guid Id) : IRequest<PickupLocationDto>;
