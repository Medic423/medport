using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Hospitals.Queries.Requests;

/// <summary>
/// See <see cref="GetHospitalSearchQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public class GetHospitalSearchQuery : IRequest<PaginatedList<HospitalDto>>
{
    public required string Query { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}
