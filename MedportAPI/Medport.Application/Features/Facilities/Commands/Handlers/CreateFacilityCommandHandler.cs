using MediatR;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class CreateFacilityCommandHandler : IRequestHandler<CreateFacilityCommand, FacilityDto>
{
    private readonly IApplicationDbContext _context;

    public CreateFacilityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FacilityDto> Handle(CreateFacilityCommand request, CancellationToken cancellationToken)
    {
        var entity = new HealthcareLocation
        {
            HealthcareUserId = request.HealthcareUserId,
            LocationName = request.LocationName,
            Address = request.Address,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Phone = request.Phone,
            FacilityType = request.FacilityType,
            IsPrimary = request.IsPrimary,
            IsActive = request.IsActive,
            Latitude = request.Latitude,
            Longitude = request.Longitude
        };

        _context.HealthcareLocations.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return new FacilityDto
        {
            Id = entity.Id,
            HealthcareUserId = entity.HealthcareUserId,
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
            UpdatedAt = entity.UpdatedAt
        };
    }
}
