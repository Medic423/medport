using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class AdminUpdateFacilityCommandHandler : IRequestHandler<AdminUpdateFacilityCommand, FacilityDto>
{
    private readonly IApplicationDbContext _context;

    public AdminUpdateFacilityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FacilityDto> Handle(AdminUpdateFacilityCommand request, CancellationToken cancellationToken)
    {
        //var entity = await _context.HealthcareLocations
        //    .Include(h => h.PickupLocations)
        //    .FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);

        //if (entity == null) return null;

        //// Update fields if provided
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
        //    // Sync healthcare user active status
        //    //var user = await _context.CenterUsers.FirstOrDefaultAsync(u => u.Id == entity.HealthcareUserId, cancellationToken);
        //    //if (user != null)
        //    //{
        //    //    user.IsActive = request.IsActive.Value;
        //    //}
        //}

        //await _context.SaveChangesAsync(cancellationToken);

        //// Update healthcareUser email if provided
        //if (!string.IsNullOrEmpty(request.Email))
        //{
        //    var user = await _context.CenterUsers.FirstOrDefaultAsync(u => u.Id == entity.HealthcareUserId, cancellationToken);
        //    if (user != null && user.Email != request.Email)
        //    {
        //        user.Email = request.Email;
        //        await _context.SaveChangesAsync(cancellationToken);
        //    }
        //}

        return new FacilityDto();

        //return new FacilityDto
        //{
        //    Id = entity.Id,
        //    HealthcareUserId = entity.HealthcareUserId,
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
        //    UpdatedAt = entity.UpdatedAt
        //};
    }
}
