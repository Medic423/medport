using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;

public class GetHealthcareLocationStatisticsQueryHandler(IApplicationDbContext context) : IRequestHandler<GetHealthcareLocationStatisticsQuery, List<HealthcareLocationStatisticsDto>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<List<HealthcareLocationStatisticsDto>> Handle(GetHealthcareLocationStatisticsQuery request, CancellationToken cancellationToken)
    {
        //var locations = await _context.HealthcareLocations
        //    .AsNoTracking()
        //    .Where(l => l.HealthcareUserId == request.HealthcareUserId)
        //    .ToListAsync(cancellationToken);

        //var result = new List<HealthcareLocationStatisticsDto>();

        //foreach (var loc in locations)
        //{
        //    var total = await _context.TransportRequests.CountAsync(t => t.OriginFacilityId == loc.Id, cancellationToken);
        //    var pending = await _context.TransportRequests.CountAsync(t => t.OriginFacilityId == loc.Id && t.Status == "PENDING", cancellationToken);
        //    var completed = await _context.TransportRequests.CountAsync(t => t.OriginFacilityId == loc.Id && t.Status == "COMPLETED", cancellationToken);

        //    result.Add(new HealthcareLocationStatisticsDto
        //    {
        //        Id = loc.Id,
        //        LocationName = loc.LocationName,
        //        Address = loc.Address,
        //        City = loc.City,
        //        State = loc.State,
        //        ZipCode = loc.ZipCode,
        //        Phone = loc.Phone,
        //        IsActive = loc.IsActive,
        //        IsPrimary = loc.IsPrimary,
        //        Latitude = loc.Latitude,
        //        Longitude = loc.Longitude,
        //        Statistics = new LocationStatsDto
        //        {
        //            TotalTrips = total,
        //            PendingTrips = pending,
        //            CompletedTrips = completed
        //        }
        //    });
        //}

        //return result;

        return null;
    }
}
