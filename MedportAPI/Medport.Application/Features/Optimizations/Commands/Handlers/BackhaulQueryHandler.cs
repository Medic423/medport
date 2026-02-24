using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Handlers;

public class BackhaulQueryHandler : IRequestHandler<BackhaulQuery, object>
{
    private readonly IApplicationDbContext _context;

    public BackhaulQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(BackhaulQuery request, CancellationToken cancellationToken)
    {
        var ids = request.RequestIds?.ToList() ?? new List<string>();
        var trips = await _context.TransportRequests.AsNoTracking().Where(tr => ids.Contains(tr.Id.ToString())).ToListAsync(cancellationToken);

        // Simplified: pair sequential trips as potential backhaul
        var pairs = new List<object>();
        for (int i = 0; i < trips.Count; i++)
        {
            for (int j = i + 1; j < trips.Count; j++)
            {
                pairs.Add(new { request1 = trips[i].Id, request2 = trips[j].Id, efficiency = 1.0 });
            }
        }

        return new { pairs, statistics = new { totalPairs = pairs.Count } };
    }
}
