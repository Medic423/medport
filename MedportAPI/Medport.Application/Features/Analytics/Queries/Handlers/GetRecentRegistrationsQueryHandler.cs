using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetRecentRegistrationsQueryHandler : IRequestHandler<GetRecentRegistrationsQuery, IEnumerable<object>>
{
    private readonly IApplicationDbContext _context;

    public GetRecentRegistrationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<object>> Handle(GetRecentRegistrationsQuery request, CancellationToken cancellationToken)
    {
        //var since = System.DateTime.UtcNow.AddDays(-request.Days);
        //if (request.Type == "facilities")
        //{
        //    var list = await _context.HealthcareLocations.AsNoTracking().Where(h => h.CreatedAt >= since).Select(h => new { h.Id, h.LocationName, h.CreatedAt }).ToListAsync(cancellationToken);
        //    return list.Cast<object>();
        //}
        //else
        //{
        //    var list = await _context.EmsAgencies.AsNoTracking().Where(a => a.CreatedAt >= since).Select(a => new { a.Id, a.Name, a.CreatedAt }).ToListAsync(cancellationToken);
        //    return list.Cast<object>();
        //}

        return null;
    }
}
