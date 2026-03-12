using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetIdleAccountsQueryHandler : IRequestHandler<GetIdleAccountsQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetIdleAccountsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetIdleAccountsQuery request, CancellationToken cancellationToken)
    {
        //var since = System.DateTime.UtcNow.AddDays(-request.Days);
        //var idleHealthcare = await _context.HealthcareUsers.AsNoTracking().Where(h => h.LastActivity == null || h.LastActivity <= since).Select(h => new { h.Id, h.Email, h.FacilityName, h.LastActivity }).ToListAsync(cancellationToken);
        //return new { idleHealthcareCount = idleHealthcare.Count, idleHealthcare };

        return null;
    }
}
