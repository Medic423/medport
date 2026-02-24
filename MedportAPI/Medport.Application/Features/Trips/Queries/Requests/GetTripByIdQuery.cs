using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.Trips.Queries.Requests;

public record GetTripByIdQuery(Guid Id) : IRequest<TransportRequestDto>;
