using MediatR;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Handlers;

public class GetEmsUnitsQueryHandler : IRequestHandler<GetEmsUnitsQuery, EmsUnitsDto>
{
    private readonly IApplicationDbContext _context;

    public GetEmsUnitsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsUnitsDto> Handle(GetEmsUnitsQuery request, CancellationToken cancellationToken)
    {
        if (request.AgencyId == Guid.Empty) return new EmsUnitsDto();

        var totalUnits = await _context.Units.CountAsync(u => u.AgencyId == request.AgencyId, cancellationToken);
        var activeUnits = await _context.Units.CountAsync(u => u.AgencyId == request.AgencyId && u.IsActive, cancellationToken);
        var availableUnits = await _context.Units.CountAsync(u => u.AgencyId == request.AgencyId && u.CurrentStatus == "AVAILABLE", cancellationToken);
        var committedUnits = await _context.Units.CountAsync(u => u.AgencyId == request.AgencyId && (u.CurrentStatus == "ASSIGNED" || u.CurrentStatus == "IN_PROGRESS"), cancellationToken);
        var outOfServiceUnits = await _context.Units.CountAsync(u => u.AgencyId == request.AgencyId && u.CurrentStatus == "OUT_OF_SERVICE", cancellationToken);

        var topUnits = await _context.Units
            .Where(u => u.AgencyId == request.AgencyId)
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .Select(u => new { u.Id, u.UnitNumber })
            .ToListAsync(cancellationToken);

        var averageUtilization = totalUnits > 0 ? (double)committedUnits / totalUnits : 0;

        return new EmsUnitsDto
        {
            TotalUnits = totalUnits,
            ActiveUnits = activeUnits,
            AvailableUnits = availableUnits,
            CommittedUnits = committedUnits,
            OutOfServiceUnits = outOfServiceUnits,
            AverageUtilization = averageUtilization,
            TopPerformingUnits = topUnits.Select(u => new { u.Id, u.UnitNumber }).ToList()
        };
    }
}
