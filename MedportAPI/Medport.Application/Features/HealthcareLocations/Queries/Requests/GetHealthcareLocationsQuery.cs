using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;

/// <summary>
/// See <see cref="GetHealthcareLocationQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record GetHealthcareLocationsQuery() : IRequest<List<HealthcareLocationDto>>
{
    public Guid HealthcareUserId { get; set; }
    public bool IsActive { get; set; } = true;
}

