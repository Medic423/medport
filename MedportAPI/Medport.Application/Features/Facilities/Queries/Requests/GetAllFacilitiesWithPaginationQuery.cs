using MediatR;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Requests;

[ExcludeFromCodeCoverage]
public class GetAllFacilitiesWithPaginationQuery : IRequest<PaginatedList<Medport.Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>>
{
    public string Name { get; set; }
    public string Type { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 0;
    public int Limit { get; set; } = 50;

    // Geographic filters
    public double? Radius { get; set; }
    public double? OriginLat { get; set; }
    public double? OriginLng { get; set; }
    public bool? ShowAllStates { get; set; }
}
