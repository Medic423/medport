using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;

public class SetPrimaryHealthcareLocationCommandHandler(IApplicationDbContext context) : IRequestHandler<SetPrimaryHealthcareLocationCommand, HealthcareLocationDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<HealthcareLocationDto> Handle(SetPrimaryHealthcareLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.HealthcareLocations.FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);
        
        if (entity == null)
        {
            throw new KeyNotFoundException($"Location with id {request.Id} not found");
        }

        // Verify ownership
        if (entity.HealthcareUserId != request.HealthcareUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to modify this location");
        }

        // Unset other primary locations for this user
        var others = await _context.HealthcareLocations
            .Where(h => h.HealthcareUserId == entity.HealthcareUserId && h.Id != entity.Id && h.IsPrimary)
            .ToListAsync(cancellationToken);

        foreach (var o in others)
        {
            o.IsPrimary = false;
            o.UpdatedAt = DateTime.UtcNow;
        }

        entity.IsPrimary = true;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new HealthcareLocationDto
        {
            Id = entity.Id,
            LocationName = entity.LocationName,
            Address = entity.Address,
            City = entity.City,
            State = entity.State,
            ZipCode = entity.ZipCode,
            Phone = entity.Phone,
            FacilityType = entity.FacilityType,
            IsPrimary = entity.IsPrimary,
            IsActive = entity.IsActive,
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            HealthcareUserId = entity.HealthcareUserId
        };
    }
}
