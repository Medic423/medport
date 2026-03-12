using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.Public.Queries.Requests;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;

public class AdminUpdateHealthcareLocationCommandHandler(IApplicationDbContext context, IMediator mediator) : IRequestHandler<AdminUpdateHealthcareLocationCommand, HealthcareLocationDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMediator _mediator = mediator;

    public async Task<HealthcareLocationDto> Handle(AdminUpdateHealthcareLocationCommand request, CancellationToken cancellationToken)
    {
        return null;
        //var entity = await _context.HealthcareLocations
        //    .Include(h => h.PickupLocations)
        //    .FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);

        //// TODO Add Error handling 
        //if (entity == null)
        //{
        //    return null;
        //}

        ////await UpdateGeoCodes(request,entity,cancellationToken);

        //await UpdateEntity(request, entity, cancellationToken);

        //await UpdateHealthcareUser(request, entity, cancellationToken);

        //return new HealthcareLocationDto
        //{
        //    Id = entity.Id,
        //    LocationName = entity.LocationName,
        //    Address = entity.Address,
        //    City = entity.City,
        //    State = entity.State,
        //    ZipCode = entity.ZipCode,
        //    Phone = entity.Phone,
        //    FacilityType = entity.FacilityType,
        //    IsPrimary = entity.IsPrimary,
        //    IsActive = entity.IsActive,
        //    Latitude = entity.Latitude,
        //    Longitude = entity.Longitude,
        //    CreatedAt = entity.CreatedAt,
        //    UpdatedAt = entity.UpdatedAt,
        //    HealthcareUserId = entity.HealthcareUserId
        //};
    }

    //private async Task UpdateGeoCodes(
    //    AdminUpdateHealthcareLocationCommand request,
    //    HealthcareLocation entity,
    //    CancellationToken cancellationToken
    //)
    //{
    //    var addressChanged =
    //        (request.Address != null && !string.Equals(request.Address, entity.Address, StringComparison.OrdinalIgnoreCase)) ||
    //        (request.City != null && !string.Equals(request.City, entity.City, StringComparison.OrdinalIgnoreCase)) ||
    //        (request.State != null && !string.Equals(request.State, entity.State, StringComparison.OrdinalIgnoreCase)) ||
    //        (request.ZipCode != null && !string.Equals(request.ZipCode, entity.ZipCode, StringComparison.OrdinalIgnoreCase));

    //    if (addressChanged && (!request.Latitude.HasValue && !request.Longitude.HasValue))
    //    {
    //        try
    //        {
    //            var geo = await _mediator.Send(new GeocodeAddressCommand
    //            {
    //                Address = request.Address ?? entity.Address,
    //                City = request.City ?? entity.City,
    //                State = request.State ?? entity.State,
    //                ZipCode = request.ZipCode ?? entity.ZipCode,
    //                FacilityName = request.LocationName ?? entity.LocationName
    //            }, cancellationToken);

    //            if (geo != null && geo.Success)
    //            {
    //                request.Latitude = geo.Latitude;
    //                request.Longitude = geo.Longitude;
    //            }
    //        }
    //        catch
    //        {
    //            // ignore geocode failures
    //        }
    //    }
    //}

    private async Task UpdateEntity(
        AdminUpdateHealthcareLocationCommand request,
        //HealthcareLocation entity,
        CancellationToken cancellationToken
    )
    {
        //entity.LocationName = request.LocationName ?? entity.LocationName;
        //entity.Address = request.Address ?? entity.Address;
        //entity.City = request.City ?? entity.City;
        //entity.State = request.State ?? entity.State;
        //entity.ZipCode = request.ZipCode ?? entity.ZipCode;
        //entity.Phone = request.Phone ?? entity.Phone;
        //entity.FacilityType = request.FacilityType ?? entity.FacilityType;
        //entity.Latitude = request.Latitude ?? entity.Latitude;
        //entity.Longitude = request.Longitude ?? entity.Longitude;

        //if (request.IsPrimary.HasValue)
        //{
        //    entity.IsPrimary = request.IsPrimary.Value;
        //}

        //if (request.IsActive.HasValue)
        //{
        //    entity.IsActive = request.IsActive.Value;
            
        //    var user = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Id == entity.HealthcareUserId, cancellationToken);
        //    if (user != null)
        //    {
        //        user.IsActive = request.IsActive.Value;
        //    }
        //}

        //entity.UpdatedAt = DateTime.UtcNow;

        //await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateHealthcareUser(
        AdminUpdateHealthcareLocationCommand request,
        //HealthcareLocation entity,
        CancellationToken cancellationToken
    )
    {
        //// Update healthcareUser email if provided
        //if (!string.IsNullOrWhiteSpace(request.Email))
        //{
        //    var user = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Id == entity.HealthcareUserId, cancellationToken);
        //    if (user != null && user.Email != request.Email)
        //    {
        //        user.Email = request.Email;
        //        user.UpdatedAt = DateTime.UtcNow;
        //        await _context.SaveChangesAsync(cancellationToken);
        //    }
        //}
    }
}
