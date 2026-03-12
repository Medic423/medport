using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.PickupLocations.Queries.Handlers;

public class GetPickupLocationsByHospitalQueryHandler : IRequestHandler<GetPickupLocationsByHospitalQuery, IEnumerable<PickupLocationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPickupLocationsByHospitalQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PickupLocationDto>> Handle(GetPickupLocationsByHospitalQuery request, CancellationToken cancellationToken)
    {
        //var query = _context.PickupLocations.AsNoTracking().Where(p => p.HospitalId == request.HospitalId);
        //if (!request.IncludeInactive)
        //{
        //    query = query.Where(p => p.IsActive);
        //}

        //var list = await query.OrderBy(p => p.Name).Select(p => new PickupLocationDto
        //{
        //    Id = p.Id,
        //    HospitalId = p.HospitalId,
        //    Name = p.Name,
        //    Description = p.Description,
        //    ContactPhone = p.ContactPhone,
        //    ContactEmail = p.ContactEmail,
        //    Floor = p.Floor,
        //    Room = p.Room,
        //    IsActive = p.IsActive,
        //    CreatedAt = p.CreatedAt,
        //    UpdatedAt = p.UpdatedAt
        //}).ToListAsync(cancellationToken);

        //return list;

        return null;
    }
}
