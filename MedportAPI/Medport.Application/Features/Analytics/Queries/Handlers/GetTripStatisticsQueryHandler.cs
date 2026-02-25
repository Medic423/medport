using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetTripStatisticsQueryHandler : IRequestHandler<GetTripStatisticsQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetTripStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetTripStatisticsQuery request, CancellationToken cancellationToken)
    {
        var total = await _context.TransportRequests.CountAsync(cancellationToken);
        var byStatus = await _context.TransportRequests
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        return new { total, byStatus };
    }
}
