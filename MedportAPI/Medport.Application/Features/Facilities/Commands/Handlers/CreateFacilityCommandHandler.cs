using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class CreateFacilityCommandHandler(
    IApplicationDbContext context,
    IMediator mediator
) : 
    IRequestHandler<CreateFacilityCommand, FacilityDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMediator _mediator = mediator;

    public async Task<FacilityDto> Handle(CreateFacilityCommand request, CancellationToken cancellationToken)
    {
        var facility = new Facility
        {
            Name = request.Name,
            OrganizationId = request.OrganizationId,
            Address = request.Address,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Phone = request.Phone,
            Email = request.Email,
            FacilityType = request.FacilityType,
            IsPrimary = request.IsPrimary,
            IsActive = request.IsActive,
            Latitude = request.Latitude,
            Longitude = request.Longitude
        };

        _context.Facilities.Add(facility);
        await _context.SaveChangesAsync(cancellationToken);

        return await _mediator.Send(new MapEntityToFacilityDtoQuery(facility), cancellationToken);
    }
}
