using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.PickupLocations.Queries.Handlers;

public class GetPickupLocationByIdQueryHandler : IRequestHandler<GetPickupLocationByIdQuery, PickupLocationDto>
{
    private readonly IApplicationDbContext _context;

    public GetPickupLocationByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PickupLocationDto> Handle(GetPickupLocationByIdQuery request, CancellationToken cancellationToken)
    {
        var p = await _context.PickupLocations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (p == null) return null;

        return new PickupLocationDto
        {
            Id = p.Id,
            HospitalId = p.HospitalId,
            Name = p.Name,
            Description = p.Description,
            ContactPhone = p.ContactPhone,
            ContactEmail = p.ContactEmail,
            Floor = p.Floor,
            Room = p.Room,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
