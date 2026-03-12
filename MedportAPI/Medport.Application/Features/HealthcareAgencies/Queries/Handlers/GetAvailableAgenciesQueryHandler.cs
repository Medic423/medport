using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Handlers;

public class GetAvailableAgenciesQueryHandler : IRequestHandler<GetAvailableAgenciesQuery, IEnumerable<EmsAgencyDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableAgenciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EmsAgencyDto>> Handle(GetAvailableAgenciesQuery request, CancellationToken cancellationToken)
    {
        //// Basic implementation: return active agencies, mark preferred if preference exists for this healthcare user
        //var agencies = await _context.EmsAgencies
        //    .AsNoTracking()
        //    .Where(a => a.IsActive)
        //    .ToListAsync(cancellationToken);

        //var preferences = await _context.HealthcareAgencyPreferences
        //    .AsNoTracking()
        //    .Where(p => p.HealthcareUserId == request.HealthcareUserId && p.IsActive)
        //    .ToListAsync(cancellationToken);

        //var result = agencies.Select(a => new EmsAgencyDto
        //{
        //    Id = a.Id,
        //    Name = a.Name,
        //    ContactName = a.ContactName,
        //    Phone = a.Phone,
        //    Email = a.Email,
        //    Address = a.Address,
        //    City = a.City,
        //    State = a.State,
        //    ZipCode = a.ZipCode,
        //    ServiceArea = a.ServiceArea,
        //    Capabilities = a.Capabilities,
        //    IsActive = a.IsActive,
        //    Status = a.Status,
        //    AddedBy = a.AddedBy,
        //    Latitude = a.Latitude,
        //    Longitude = a.Longitude,
        //    AcceptsNotifications = a.AcceptsNotifications,
        //    IsPreferred = preferences.Any(p => p.PreferredAgencyId == a.Id)
        //}).ToList();

        //return result;

        return null;
    }
}
