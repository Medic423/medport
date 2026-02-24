using MediatR;
using Medport.Application.Tracc.Features.Public.Queries.Requests;
using Medport.Application.Tracc.Features.Public.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Handlers;

public class GetHospitalsQueryHandler : IRequestHandler<GetHospitalsQuery, IEnumerable<HospitalPublicDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHospitalsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HospitalPublicDto>> Handle(GetHospitalsQuery request, CancellationToken cancellationToken)
    {
        var hospitals = await _context.Hospitals
            .AsNoTracking()
            .Where(h => h.IsActive)
            .Select(h => new HospitalPublicDto
            {
                Id = h.Id,
                Name = h.Name,
                Address = h.Address,
                City = h.City,
                State = h.State,
                ZipCode = h.ZipCode,
                Phone = h.Phone,
                Email = h.Email,
                Type = h.Type,
                Latitude = h.Latitude,
                Longitude = h.Longitude
            })
            .ToListAsync(cancellationToken);

        // Sort by name
        hospitals = hospitals.OrderBy(h => h.Name).ToList();

        return hospitals;
    }
}
