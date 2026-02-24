using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Handlers;

public class UpdatePickupLocationCommandHandler : IRequestHandler<UpdatePickupLocationCommand, PickupLocationDto>
{
    private readonly IApplicationDbContext _context;

    public UpdatePickupLocationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PickupLocationDto> Handle(UpdatePickupLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PickupLocations.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (entity == null) return null;

        // If name changed, check duplicates
        if (!string.IsNullOrWhiteSpace(request.Name) && request.Name.Trim() != entity.Name)
        {
            var duplicate = await _context.PickupLocations.FirstOrDefaultAsync(p => p.HospitalId == entity.HospitalId && p.Name == request.Name.Trim() && p.IsActive && p.Id != entity.Id, cancellationToken);
            if (duplicate != null)
            {
                // Duplicate found - return existing entity without changes (caller should handle conflict)
                return null;
            }
        }

        entity.Name = request.Name?.Trim() ?? entity.Name;
        entity.Description = request.Description?.Trim() ?? entity.Description;
        entity.ContactPhone = request.ContactPhone?.Trim() ?? entity.ContactPhone;
        entity.ContactEmail = request.ContactEmail?.Trim() ?? entity.ContactEmail;
        entity.Floor = request.Floor?.Trim() ?? entity.Floor;
        entity.Room = request.Room?.Trim() ?? entity.Room;
        if (request.IsActive.HasValue) entity.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return new PickupLocationDto
        {
            Id = entity.Id,
            HospitalId = entity.HospitalId,
            Name = entity.Name,
            Description = entity.Description,
            ContactPhone = entity.ContactPhone,
            ContactEmail = entity.ContactEmail,
            Floor = entity.Floor,
            Room = entity.Room,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
