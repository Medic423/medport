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

public class SearchRegisteredAgenciesQueryHandler : IRequestHandler<SearchRegisteredAgenciesQuery, IEnumerable<EmsAgencyDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchRegisteredAgenciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EmsAgencyDto>> Handle(SearchRegisteredAgenciesQuery request, CancellationToken cancellationToken)
    {
        //var q = request.Query?.Trim();
        //if (string.IsNullOrEmpty(q)) return new List<EmsAgencyDto>();

        //var agencies = await _context.EmsAgencies.AsNoTracking()
        //    .Where(a => a.Name.Contains(q))
        //    .Take(50)
        //    .ToListAsync(cancellationToken);

        //return agencies.Select(a => new EmsAgencyDto
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
        //}).ToList();

        return null;
    }
}
