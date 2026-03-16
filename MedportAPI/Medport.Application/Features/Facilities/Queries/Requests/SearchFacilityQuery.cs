using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Queries.Handlers;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Requests;

/// <summary>
/// See <see cref="SearchFacilityQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record SearchFacilityQuery : IRequest<PaginatedList<FacilityDto>>
{
    public string? Query { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}
