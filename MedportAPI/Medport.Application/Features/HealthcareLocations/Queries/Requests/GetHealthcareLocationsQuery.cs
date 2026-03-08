using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;

/// <summary>
/// See <see cref="GetHealthcareLocationsQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record GetHealthcareLocationsQuery() : IRequest<List<HealthcareLocationDto>>
{
    public Guid HealthcareUserId { get; set; }
    public bool IsActive { get; set; } = true;
}

