using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Application.Tracc.Features.Units.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using static Medport.Domain.Constants;

namespace Medport.Application.Tracc.Features.Units.Queries.Handlers;

/// <summary>
/// Handler for retrieving available units for an agency
/// </summary>
[ExcludeFromCodeCoverage]
public class GetAvailableUnitsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAvailableUnitsQuery, List<UnitDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<List<UnitDto>> Handle(GetAvailableUnitsQuery request, CancellationToken cancellationToken)
    {
        //// Query for available units matching the criteria
        //var units = await _context.Units
        //    .Where(u => u.AgencyId == request.AgencyId 
        //        && u.IsActive 
        //        && u.CurrentStatus == UnitStatuses.Available)
        //    .OrderBy(u => u.UnitNumber)
        //    .ToListAsync(cancellationToken);

        //// Map to DTOs
        //var unitDtos = _mapper.Map<List<UnitDto>>(units);

        //return unitDtos;

        return null;
    }
}