using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Queries.Requests;
using Medport.Domain.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Handlers;

public class GetPerformanceQueryHandler : IRequestHandler<GetPerformanceQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetPerformanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetPerformanceQuery request, CancellationToken cancellationToken)
    {
        // Simplified implementation: return counts of completed trips in timeframe
        var now = System.DateTime.UtcNow;
        var timeRanges = request.Timeframe switch
        {
            "1h" => System.TimeSpan.FromHours(1),
            "7d" => System.TimeSpan.FromDays(7),
            "30d" => System.TimeSpan.FromDays(30),
            _ => System.TimeSpan.FromHours(24)
        };

        var start = now.Subtract(timeRanges);
        var query = _context.TransportRequests.AsNoTracking().Where(tr => tr.Status == "COMPLETED" && tr.CompletionTimestamp >= start && tr.CompletionTimestamp <= now);
        if (!string.IsNullOrEmpty(request.UnitId))
        {
            query = query.Where(tr => tr.AssignedUnitId != null && tr.AssignedUnitId.ToString() == request.UnitId);
        }

        var trips = await query.ToListAsync(cancellationToken);

        return new {
            timeframe = request.Timeframe,
            totalTrips = trips.Count
        };
    }
}
