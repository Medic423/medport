using MediatR;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Requests;
using Medport.Domain.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.ProductionUnits.Queries.Handlers;

public class GetProductionUnitAnalyticsQueryHandler : IRequestHandler<GetProductionUnitAnalyticsQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetProductionUnitAnalyticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetProductionUnitAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var total = await _context.Units.CountAsync(cancellationToken);
        var available = await _context.Units.CountAsync(u => u.IsActive && u.CurrentStatus == "AVAILABLE", cancellationToken: cancellationToken);
        var committed = await _context.Units.CountAsync(u => u.IsActive && u.CurrentStatus == "COMMITTED", cancellationToken: cancellationToken);
        var outOfService = await _context.Units.CountAsync(u => !u.IsActive, cancellationToken: cancellationToken);
        var maintenance = await _context.Units.CountAsync(u => u.NextMaintenance != null && u.NextMaintenance <= System.DateTime.UtcNow, cancellationToken: cancellationToken);

        return new {
            totalUnits = total,
            availableUnits = available,
            committedUnits = committed,
            outOfServiceUnits = outOfService,
            maintenanceUnits = maintenance
        };
    }
}
