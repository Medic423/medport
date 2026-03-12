using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Handlers;

public class UpdateDestinationForHealthcareUserCommandHandler : IRequestHandler<UpdateDestinationForHealthcareUserCommand, HealthcareDestinationDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateDestinationForHealthcareUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthcareDestinationDto> Handle(UpdateDestinationForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        //var entity = await _context.HealthcareDestinations.FirstOrDefaultAsync(h => h.Id == request.Id && h.HealthcareUserId == request.HealthcareUserId, cancellationToken);
        //if (entity == null) return null;

        //entity.DestinationName = request.DestinationName;
        //entity.Address = request.Address;
        //entity.City = request.City;
        //entity.State = request.State;
        //entity.ZipCode = request.ZipCode;
        //entity.Phone = request.Phone;
        //entity.Latitude = request.Latitude;
        //entity.Longitude = request.Longitude;
        //entity.FacilityType = request.FacilityType;
        //entity.IsActive = request.IsActive;

        //await _context.SaveChangesAsync(cancellationToken);

        //return new HealthcareDestinationDto
        //{
        //    Id = entity.Id,
        //    HealthcareUserId = entity.HealthcareUserId,
        //    DestinationName = entity.DestinationName,
        //    Address = entity.Address,
        //    City = entity.City,
        //    State = entity.State,
        //    ZipCode = entity.ZipCode,
        //    Phone = entity.Phone,
        //    Latitude = entity.Latitude,
        //    Longitude = entity.Longitude,
        //    FacilityType = entity.FacilityType,
        //    IsActive = entity.IsActive,
        //    CreatedAt = entity.CreatedAt,
        //    UpdatedAt = entity.UpdatedAt
        //};

        return null;
    }
}
