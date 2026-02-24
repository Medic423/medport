using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Handlers;

public class UpdateAgencyForHealthcareUserCommandHandler : IRequestHandler<UpdateAgencyForHealthcareUserCommand, EmsAgencyDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateAgencyForHealthcareUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsAgencyDto> Handle(UpdateAgencyForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.EmsAgencies.FirstOrDefaultAsync(a => a.Id == request.Id && a.AddedBy == request.HealthcareUserId, cancellationToken);
        if (entity == null) return null;

        entity.Name = request.Name ?? entity.Name;
        entity.ContactName = request.ContactName ?? entity.ContactName;
        entity.Phone = request.Phone ?? entity.Phone;
        entity.Email = request.Email ?? entity.Email;
        entity.Address = request.Address ?? entity.Address;
        entity.City = request.City ?? entity.City;
        entity.State = request.State ?? entity.State;
        entity.ZipCode = request.ZipCode ?? entity.ZipCode;
        entity.ServiceArea = request.ServiceArea ?? entity.ServiceArea;
        entity.Capabilities = request.Capabilities ?? entity.Capabilities;
        entity.Latitude = request.Latitude ?? entity.Latitude;
        entity.Longitude = request.Longitude ?? entity.Longitude;

        await _context.SaveChangesAsync(cancellationToken);

        return new EmsAgencyDto
        {
            Id = entity.Id,
            Name = entity.Name,
            ContactName = entity.ContactName,
            Phone = entity.Phone,
            Email = entity.Email,
            Address = entity.Address,
            City = entity.City,
            State = entity.State,
            ZipCode = entity.ZipCode,
            ServiceArea = entity.ServiceArea,
            Capabilities = entity.Capabilities,
            IsActive = entity.IsActive,
            Status = entity.Status,
            AddedBy = entity.AddedBy,
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            AcceptsNotifications = entity.AcceptsNotifications,
            IsPreferred = false
        };
    }
}
