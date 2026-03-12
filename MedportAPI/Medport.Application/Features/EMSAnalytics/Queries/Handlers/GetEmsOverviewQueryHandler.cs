using MediatR;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Handlers;

public class GetEmsOverviewQueryHandler : IRequestHandler<GetEmsOverviewQuery, EmsOverviewDto>
{
    private readonly IApplicationDbContext _context;

    public GetEmsOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsOverviewDto> Handle(GetEmsOverviewQuery request, CancellationToken cancellationToken)
    {
        //if (request.AgencyId == Guid.Empty)
        //{
        //    return new EmsOverviewDto();
        //}

        //var totalTrips = await _context.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId, cancellationToken);
        //var completedTrips = await _context.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId && t.Status == "COMPLETED", cancellationToken);
        //var pendingTrips = await _context.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId && t.Status == "PENDING", cancellationToken);

        //var responseTimes = await _context.TransportRequests
        //    .Where(t => t.AssignedAgencyId == request.AgencyId && t.AcceptedTimestamp != null && t.RequestTimestamp != null)
        //    .Select(t => new { t.AcceptedTimestamp, t.RequestTimestamp })
        //    .ToListAsync(cancellationToken);

        //double avgResponse = 0;
        //if (responseTimes.Count > 0)
        //{
        //    var sum = responseTimes.Sum(r => ((r.AcceptedTimestamp.Value - r.RequestTimestamp).TotalMinutes));
        //    avgResponse = sum / responseTimes.Count;
        //}

        //var efficiency = totalTrips > 0 ? (double)completedTrips / totalTrips : 0;

        //var agency = await _context.EmsAgencies.FindAsync(new object[] { request.AgencyId }, cancellationToken);
        //var agencyName = agency?.Name ?? string.Empty;

        //return new EmsOverviewDto
        //{
        //    TotalTrips = totalTrips,
        //    CompletedTrips = completedTrips,
        //    PendingTrips = pendingTrips,
        //    Efficiency = efficiency,
        //    AverageResponseTimeMinutes = avgResponse,
        //    AgencyName = agencyName
        //};

        return null;
    }
}
