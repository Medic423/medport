using MediatR;
using Medport.Common.DTOs;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Requests;

[ExcludeFromCodeCoverage]
public class GetFacilitySearchQuery : IRequest<PaginatedList<FacilityDto>>
{
    public string Q { get; set; }
    public int Page { get; set; } = 0;
    public int Limit { get; set; } = 50;
}
