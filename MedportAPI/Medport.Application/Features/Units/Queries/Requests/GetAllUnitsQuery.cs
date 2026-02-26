using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Application.Tracc.Features.Units.Queries.Handlers;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Queries.Requests;

/// <summary>
/// See <see cref="GetAllUnitsQueryHandler"/>
/// </summary>
/// 
[ExcludeFromCodeCoverage]
public class GetAllUnitsQuery : IRequest<PaginatedList<UnitDto>>
{
    public Guid? AgencyId { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 50;
}
