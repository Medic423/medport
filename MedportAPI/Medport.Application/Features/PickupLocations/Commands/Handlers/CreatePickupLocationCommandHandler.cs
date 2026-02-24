using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;
using Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Handlers;

public class CreatePickupLocationCommandHandler : IRequestHandler<CreatePickupLocationCommand, PickupLocationDto>
{
    private readonly IApplicationDbContext _context;

    public CreatePickupLocationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PickupLocationDto> Handle(CreatePickupLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = new PickupLocation
        {
            HospitalId = request.HospitalId,
            Name = request.Name?.Trim(),
            Description = request.Description?.Trim(),
            ContactPhone = request.ContactPhone?.Trim(),
            ContactEmail = request.ContactEmail?.Trim(),
            Floor = request.Floor?.Trim(),
            Room = request.Room?.Trim(),
            IsActive = true
        };

        _context.PickupLocations.Add(entity);
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
