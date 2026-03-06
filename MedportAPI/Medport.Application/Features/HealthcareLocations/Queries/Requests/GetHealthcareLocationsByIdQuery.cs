using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;

/// <summary>
/// See <see cref="GetHealthcareLocationsByIdQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record GetHealthcareLocationsByIdQuery(Guid HealthcareLocationId) : IRequest<HealthcareLocationDto>;

