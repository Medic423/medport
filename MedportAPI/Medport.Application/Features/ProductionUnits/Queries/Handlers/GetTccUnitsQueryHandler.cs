using MediatR;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Dtos;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.ProductionUnits.Queries.Handlers;

public class GetTccUnitsQueryHandler : IRequestHandler<GetTccUnitsQuery, IEnumerable<ProductionUnitDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTccUnitsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductionUnitDto>> Handle(GetTccUnitsQuery request, CancellationToken cancellationToken)
    {
        //var units = await _context.Units.AsNoTracking().ToListAsync(cancellationToken);

        //return units.Select(u => new ProductionUnitDto
        //{
        //    Id = u.Id,
        //    AgencyId = u.AgencyId,
        //    UnitNumber = u.UnitNumber,
        //    Type = u.Type,
        //    Capabilities = u.Capabilities,
        //    CurrentStatus = u.CurrentStatus,
        //    CurrentLocation = u.CurrentLocation,
        //    CrewSize = u.CrewSize,
        //    Equipment = u.Equipment,
        //    ShiftStart = u.ShiftStart,
        //    ShiftEnd = u.ShiftEnd,
        //    IsActive = u.IsActive,
        //    CreatedAt = u.CreatedAt,
        //    UpdatedAt = u.UpdatedAt
        //}).ToList();

        return null;
    }
}
