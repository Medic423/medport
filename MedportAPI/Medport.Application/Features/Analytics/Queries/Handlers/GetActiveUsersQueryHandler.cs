using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetActiveUsersQueryHandler : IRequestHandler<GetActiveUsersQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetActiveUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetActiveUsersQuery request, CancellationToken cancellationToken)
    {
        //var since = System.DateTime.UtcNow.AddMinutes(-request.ThresholdMinutes);

        //var healthcare = await _context.HealthcareUsers.AsNoTracking()
        //    .Where(h => h.LastActivity != null && h.LastActivity >= since)
        //    .OrderByDescending(h => h.LastActivity)
        //    .Select(h => new { h.Id, h.Email, h.FacilityName, h.LastActivity })
        //    .ToListAsync(cancellationToken);

        //var ems = await _context.EmsUsers.AsNoTracking()
        //    .Where(e => e.LastActivity != null && e.LastActivity >= since)
        //    .OrderByDescending(e => e.LastActivity)
        //    .Select(e => new { e.Id, e.Email, e.Name, e.LastActivity })
        //    .ToListAsync(cancellationToken);

        //return new { healthcare, ems };

        return null;
    }
}
