using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.Trips.Commands.Requests;

public class AuthorizeTripCommand : IRequest<TransportRequestDto>
{
    public Guid Id { get; set; }
    public DateTime AuthorizedTime { get; set; }
}
