using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;

/// <summary>
/// See <see cref="SetPrimaryHealthcareLocationCommandHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record SetPrimaryHealthcareLocationCommand() : IRequest<HealthcareLocationDto>
{
    public Guid Id { get; set; }
    public Guid HealthcareUserId { get; set; }
}
