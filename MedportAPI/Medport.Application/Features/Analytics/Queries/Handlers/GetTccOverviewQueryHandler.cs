using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetTccOverviewQueryHandler : IRequestHandler<GetTccOverviewQuery, TccOverviewDto>
{
    private readonly IApplicationDbContext _context;

    public GetTccOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TccOverviewDto> Handle(GetTccOverviewQuery request, CancellationToken cancellationToken)
    {
        //var total = await _context.TransportRequests.CountAsync(cancellationToken);
        //var pending = await _context.TransportRequests.CountAsync(t => t.Status == "PENDING" || t.Status == "PENDING_DISPATCH", cancellationToken);
        //var completed = await _context.TransportRequests.CountAsync(t => t.Status == "COMPLETED", cancellationToken);
        ////var activeAgencies = await _context.EmsAgencies.CountAsync(a => a.IsActive, cancellationToken);
        ////var activeHospitals = await _context.Hospitals.CountAsync(h => h.IsActive, cancellationToken);

        //return new TccOverviewDto
        //{
        //    TotalTrips = total,
        //    PendingTrips = pending,
        //    CompletedTrips = completed,
        //    ActiveAgencies = activeAgencies,
        //    ActiveHospitals = activeHospitals
        //};

        return null;
    }
}
