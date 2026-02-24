using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class GetFacilityByIdQueryHandler : IRequestHandler<GetFacilityByIdQuery, FacilityDto>
{
    private readonly IApplicationDbContext _context;

    public GetFacilityByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FacilityDto> Handle(GetFacilityByIdQuery request, CancellationToken cancellationToken)
    {
        var facility = await _context.HealthcareLocations
            .AsNoTracking()
            .Where(h => h.Id == request.Id)
            .Select(h => new FacilityDto
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
            })
            .FirstOrDefaultAsync(cancellationToken);

        return facility;
    }
}
