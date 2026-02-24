using MediatR;
using Medport.Common.DTOs;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class GetFacilitySearchQueryHandler : IRequestHandler<GetFacilitySearchQuery, PaginatedList<FacilityDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFacilitySearchQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<FacilityDto>> Handle(GetFacilitySearchQuery request, CancellationToken cancellationToken)
    {
        var q = request.Q?.Trim();

        IQueryable<HealthcareLocation> query = _context.HealthcareLocations.AsNoTracking();

        if (!string.IsNullOrEmpty(q))
        {
            query = query.Where(h => (!string.IsNullOrEmpty(h.LocationName) && h.LocationName.Contains(q)) || (!string.IsNullOrEmpty(h.Address) && h.Address.Contains(q)) || (!string.IsNullOrEmpty(h.City) && h.City.Contains(q)));
        }

        var projected = query.Select(h => new FacilityDto
        {
            Id = h.Id,
            HealthcareUserId = h.HealthcareUserId,
            LocationName = h.LocationName,
            Address = h.Address,
            City = h.City,
            State = h.State,
            ZipCode = h.ZipCode,
            Phone = h.Phone,
            FacilityType = h.FacilityType,
            IsPrimary = h.IsPrimary,
            IsActive = h.IsActive,
            Latitude = h.Latitude,
            Longitude = h.Longitude,
            CreatedAt = h.CreatedAt,
            UpdatedAt = h.UpdatedAt
        });

        return await PaginatedList<FacilityDto>.CreateAsync(projected, request.Page, request.Limit, cancellationToken);
    }
}
