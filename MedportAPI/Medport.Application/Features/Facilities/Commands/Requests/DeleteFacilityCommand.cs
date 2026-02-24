using MediatR;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Requests;

[ExcludeFromCodeCoverage]
public record DeleteFacilityCommand(Guid Id) : IRequest;
