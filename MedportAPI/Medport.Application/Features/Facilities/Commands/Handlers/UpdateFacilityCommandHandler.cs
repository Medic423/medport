using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class UpdateFacilityCommandHandler : IRequestHandler<UpdateFacilityCommand, FacilityDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateFacilityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FacilityDto> Handle(UpdateFacilityCommand request, CancellationToken cancellationToken)
    {
        //var entity = await _context.HealthcareLocations.FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);
        //if (entity == null) return null;

        //entity.LocationName = request.LocationName;
        //entity.Address = request.Address;
        //entity.City = request.City;
        //entity.State = request.State;
        //entity.ZipCode = request.ZipCode;
        //entity.Phone = request.Phone;
        //entity.FacilityType = request.FacilityType;
        //entity.IsPrimary = request.IsPrimary;
        //entity.IsActive = request.IsActive;
        //entity.Latitude = request.Latitude;
        //entity.Longitude = request.Longitude;

        //await _context.SaveChangesAsync(cancellationToken);

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

        return null;
    }
}
