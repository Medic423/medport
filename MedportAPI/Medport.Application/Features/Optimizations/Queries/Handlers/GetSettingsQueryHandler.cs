using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Queries.Requests;
using Medport.Domain.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Handlers;

public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetSettingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        // In this simplified version, look for a RouteOptimizationSetting entity if exists
        // Fallback: return default settings
        try
        {
            // If a DbSet exists for route optimization settings, query it; otherwise return default
            // For now, return a default settings object
            return new {
                id = "global-default",
                agencyId = request.AgencyId,
                updatedAt = System.DateTime.UtcNow
            };
        }
        catch
        {
            return new { id = "global-default", agencyId = request.AgencyId };
        }
    }
}
