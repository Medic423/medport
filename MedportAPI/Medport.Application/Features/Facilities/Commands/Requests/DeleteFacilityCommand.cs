using MediatR;
using Medport.Application.Tracc.Features.Facilities.Commands.Handlers;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Requests;

/// <summary>
/// See <see cref="DeleteFacilityCommandHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record DeleteFacilityCommand(Guid Id) : IRequest;
