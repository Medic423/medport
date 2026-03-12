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

public class GetEmsTripsQueryHandler : IRequestHandler<GetEmsTripsQuery, EmsTripsDto>
{
    private readonly IApplicationDbContext _context;

    public GetEmsTripsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsTripsDto> Handle(GetEmsTripsQuery request, CancellationToken cancellationToken)
    {
        //if (request.AgencyId == Guid.Empty) return new EmsTripsDto();

        //var prisma = _context;

        //var totalTrips = await prisma.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId, cancellationToken);
        //var completedTrips = await prisma.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId && t.Status == "COMPLETED", cancellationToken);
        //var pendingTrips = await prisma.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId && t.Status == "PENDING", cancellationToken);
        //var cancelledTrips = await prisma.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId && t.Status == "CANCELLED", cancellationToken);

        //var byLevel = await prisma.TransportRequests
        //    .Where(t => t.AssignedAgencyId == request.AgencyId)
        //    .GroupBy(t => t.TransportLevel)
        //    .Select(g => new { Level = g.Key, Count = g.Count() })
        //    .ToListAsync(cancellationToken);

        //var byPriority = await prisma.TransportRequests
        //    .Where(t => t.AssignedAgencyId == request.AgencyId)
        //    .GroupBy(t => t.Priority)
        //    .Select(g => new { Priority = g.Key, Count = g.Count() })
        //    .ToListAsync(cancellationToken);

        //var tripDurations = await prisma.TransportRequests
        //    .Where(t => t.AssignedAgencyId == request.AgencyId && t.CompletionTimestamp != null && t.PickupTimestamp != null)
        //    .Select(t => new { t.CompletionTimestamp, t.PickupTimestamp })
        //    .ToListAsync(cancellationToken);

        //double avgDuration = 0;
        //if (tripDurations.Count > 0)
        //{
        //    var sum = tripDurations.Sum(t => ((t.CompletionTimestamp.Value - t.PickupTimestamp.Value).TotalMinutes));
        //    avgDuration = sum / tripDurations.Count;
        //}

        //var tripsByLevel = new Dictionary<string, int> { { "BLS", 0 }, { "ALS", 0 }, { "CCT", 0 } };
        //foreach (var g in byLevel)
        //{
        //    if (!string.IsNullOrEmpty(g.Level)) tripsByLevel[g.Level] = g.Count;
        //}

        //var tripsByPriority = new Dictionary<string, int> { { "LOW", 0 }, { "MEDIUM", 0 }, { "HIGH", 0 }, { "URGENT", 0 }, { "CRITICAL", 0 } };
        //foreach (var g in byPriority)
        //{
        //    if (!string.IsNullOrEmpty(g.Priority)) tripsByPriority[g.Priority] = g.Count;
        //}

        //return new EmsTripsDto
        //{
        //    TotalTrips = totalTrips,
        //    CompletedTrips = completedTrips,
        //    PendingTrips = pendingTrips,
        //    CancelledTrips = cancelledTrips,
        //    TripsByLevel = tripsByLevel,
        //    TripsByPriority = tripsByPriority,
        //    AverageTripDurationMinutes = avgDuration
        //};

        return null;
    }
}
