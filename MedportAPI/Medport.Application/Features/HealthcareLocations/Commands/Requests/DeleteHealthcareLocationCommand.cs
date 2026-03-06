using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;

/// <summary>
/// See <see cref="DeleteHealthcareLocationCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record DeleteHealthcareLocationCommand(Guid Id) : IRequest;
