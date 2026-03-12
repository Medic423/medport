using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Domain.Interfaces;
using Medport.Domain.Entities;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Handlers;

public class CreateAgencyForHealthcareUserCommandHandler : IRequestHandler<CreateAgencyForHealthcareUserCommand, EmsAgencyDto>
{
    private readonly IApplicationDbContext _context;

    public CreateAgencyForHealthcareUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsAgencyDto> Handle(CreateAgencyForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        //var entity = new EmsAgency
        //{
        //    Name = request.Name,
        //    ContactName = request.ContactName,
        //    Phone = request.Phone,
        //    Email = request.Email,
        //    Address = request.Address,
        //    City = request.City,
        //    State = request.State,
        //    ZipCode = request.ZipCode,
        //    ServiceArea = request.ServiceArea ?? new System.Collections.Generic.List<string>(),
        //    Capabilities = request.Capabilities ?? new System.Collections.Generic.List<string>(),
        //    AddedBy = request.HealthcareUserId,
        //    Latitude = request.Latitude,
        //    Longitude = request.Longitude
        //};

        //_context.EmsAgencies.Add(entity);
        //await _context.SaveChangesAsync(cancellationToken);

        //return new EmsAgencyDto
        //{
        //    Id = entity.Id,
        //    Name = entity.Name,
        //    ContactName = entity.ContactName,
        //    Phone = entity.Phone,
        //    Email = entity.Email,
        //    Address = entity.Address,
        //    City = entity.City,
        //    State = entity.State,
        //    ZipCode = entity.ZipCode,
        //    ServiceArea = entity.ServiceArea,
        //    Capabilities = entity.Capabilities,
        //    IsActive = entity.IsActive,
        //    Status = entity.Status,
        //    AddedBy = entity.AddedBy,
        //    Latitude = entity.Latitude,
        //    Longitude = entity.Longitude,
        //    AcceptsNotifications = entity.AcceptsNotifications,
        //    IsPreferred = false
        //};

        return null;
    }
}
