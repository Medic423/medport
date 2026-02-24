using MediatR;
using System;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;

public record DeletePickupLocationCommand(Guid Id) : IRequest;
