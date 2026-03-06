using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;

/// <summary>
/// See <see cref="GetAllHealthcareLocationsWithPaginationQueryHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public class GetAllHealthcareLocationsWithPaginationQuery : IRequest<PaginatedListDapper<HealthcareLocationDto>>
{
    public string? LocationName { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? FacilityType { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 50;
    public string? OrderBy { get; set; } = "IsActive desc, State asc, City asc, LocationName asc";
}
