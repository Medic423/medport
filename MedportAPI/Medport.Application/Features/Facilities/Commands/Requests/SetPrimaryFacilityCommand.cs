using MediatR;
using System;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Requests;

public record SetPrimaryFacilityCommand(Guid Id) : IRequest;
