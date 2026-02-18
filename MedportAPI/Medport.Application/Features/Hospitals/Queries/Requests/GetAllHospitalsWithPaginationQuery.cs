using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Hospitals.Queries.Requests;

[ExcludeFromCodeCoverage]
public class GetAllHospitalsWithPaginationQuery : IRequest<PaginatedList<HospitalDto>>
{
    public string? Name { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Type { get; set; }
    public string? Region { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 50;
}
