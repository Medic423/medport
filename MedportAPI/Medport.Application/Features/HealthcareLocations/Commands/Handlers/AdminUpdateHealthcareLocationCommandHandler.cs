using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;

public class AdminUpdateHealthcareLocationCommandHandler : IRequestHandler<AdminUpdateHealthcareLocationCommand, HealthcareLocationDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public AdminUpdateHealthcareLocationCommandHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<HealthcareLocationDto> Handle(AdminUpdateHealthcareLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.HealthcareLocations
            .Include(h => h.PickupLocations)
            .FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        // Determine if address fields changed and latitude/longitude not provided
        var addressChanged = !string.IsNullOrWhiteSpace(request.Address) || !string.IsNullOrWhiteSpace(request.City) || !string.IsNullOrWhiteSpace(request.State) || !string.IsNullOrWhiteSpace(request.ZipCode);
        if (addressChanged && (!request.Latitude.HasValue && !request.Longitude.HasValue))
        {
            // Attempt geocode via mediator if available
            try
            {
                var geo = await _mediator.Send(new Medport.Application.Tracc.Features.Public.Queries.Requests.GeocodeAddressCommand
                {
                    Address = request.Address ?? entity.Address,
                    City = request.City ?? entity.City,
                    State = request.State ?? entity.State,
                    ZipCode = request.ZipCode ?? entity.ZipCode,
                    FacilityName = request.LocationName ?? entity.LocationName
                }, cancellationToken);

                if (geo != null && geo.Success)
                {
                    request.Latitude = geo.Latitude;
                    request.Longitude = geo.Longitude;
                }
            }
            catch
            {
                // ignore geocode failures
            }
        }

        // Update entity fields
        entity.LocationName = request.LocationName ?? entity.LocationName;
        entity.Address = request.Address ?? entity.Address;
        entity.City = request.City ?? entity.City;
        entity.State = request.State ?? entity.State;
        entity.ZipCode = request.ZipCode ?? entity.ZipCode;
        entity.Phone = request.Phone ?? entity.Phone;
        entity.FacilityType = request.FacilityType ?? entity.FacilityType;
        entity.Latitude = request.Latitude ?? entity.Latitude;
        entity.Longitude = request.Longitude ?? entity.Longitude;

        if (request.IsPrimary.HasValue)
        {
            entity.IsPrimary = request.IsPrimary.Value;
        }

        if (request.IsActive.HasValue)
        {
            entity.IsActive = request.IsActive.Value;
            // Sync to HealthcareUser so login works
            var user = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Id == entity.HealthcareUserId, cancellationToken);
            if (user != null)
            {
                user.IsActive = request.IsActive.Value;
            }
        }

        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Update healthcareUser email if provided
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var user = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Id == entity.HealthcareUserId, cancellationToken);
            if (user != null && user.Email != request.Email)
            {
                user.Email = request.Email;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

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
