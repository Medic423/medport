using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetFacilitiesOnlineQueryHandler : IRequestHandler<GetFacilitiesOnlineQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetFacilitiesOnlineQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetFacilitiesOnlineQuery request, CancellationToken cancellationToken)
    {
        //// Placeholder: return counts of active healthcare locations and agencies
        //var last24 = System.DateTime.UtcNow.AddHours(-24);
        //var last7d = System.DateTime.UtcNow.AddDays(-7);

        //var online24 = await _context.HealthcareLocations.AsNoTracking().CountAsync(h => h.UpdatedAt >= last24, cancellationToken);
        //var online7d = await _context.HealthcareLocations.AsNoTracking().CountAsync(h => h.UpdatedAt >= last7d, cancellationToken);

        //return new { online24, online7d };

        return null;
    }
}
