using MediatR;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Handlers;

public class CreateDestinationForHealthcareUserCommandHandler : IRequestHandler<CreateDestinationForHealthcareUserCommand, HealthcareDestinationDto>
{
    private readonly IApplicationDbContext _context;

    public CreateDestinationForHealthcareUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthcareDestinationDto> Handle(CreateDestinationForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        //var entity = new HealthcareDestination
        //{
        //    HealthcareUserId = request.HealthcareUserId,
        //    DestinationName = request.DestinationName,
        //    Address = request.Address,
        //    City = request.City,
        //    State = request.State,
        //    ZipCode = request.ZipCode,
        //    Phone = request.Phone,
        //    Latitude = request.Latitude,
        //    Longitude = request.Longitude,
        //    FacilityType = request.FacilityType,
        //    IsActive = request.IsActive
        //};

        //_context.HealthcareDestinations.Add(entity);
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
