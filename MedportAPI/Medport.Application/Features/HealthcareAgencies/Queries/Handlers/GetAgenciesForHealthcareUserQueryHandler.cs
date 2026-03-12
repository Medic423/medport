using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;
using Medport.Domain.Interfaces;
using Medport.Domain.Entities;
using Medport.Common.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Handlers;

public class GetAgenciesForHealthcareUserQueryHandler : IRequestHandler<GetAgenciesForHealthcareUserQuery, PaginatedList<EmsAgencyDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAgenciesForHealthcareUserQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<EmsAgencyDto>> Handle(GetAgenciesForHealthcareUserQuery request, CancellationToken cancellationToken)
    {
        //IQueryable<EmsAgency> query = _context.EmsAgencies.AsNoTracking();

        //if (!string.IsNullOrWhiteSpace(request.Name))
        //{
        //    query = query.Where(a => a.Name.Contains(request.Name));
        //}

        //if (!string.IsNullOrWhiteSpace(request.City))
        //{
        //    query = query.Where(a => a.City.Contains(request.City));
        //}

        //if (!string.IsNullOrWhiteSpace(request.State))
        //{
        //    query = query.Where(a => a.State.Contains(request.State));
        //}

        //if (request.IsActive != null)
        //{
        //    query = query.Where(a => a.IsActive == request.IsActive);
        //}

        //var projected = query.Select(a => new EmsAgencyDto
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
        //    IsPreferred = false
        //});

        //var list = await PaginatedList<EmsAgencyDto>.CreateAsync(projected, request.Page, request.Limit, cancellationToken);

        //// annotate preferred statuses
        //var prefIds = await _context.HealthcareAgencyPreferences
        //    .Where(p => p.HealthcareUserId == request.HealthcareUserId && p.IsActive)
        //    .Select(p => p.PreferredAgencyId)
        //    .ToListAsync(cancellationToken);

        //foreach (var item in list.Items)
        //{
        //    if (prefIds.Contains(item.Id))
        //    {
        //        // Reflection not needed, set property directly
        //        item.IsPreferred = true;
        //    }
        //}

        //return list;

        return null;
    }
}
