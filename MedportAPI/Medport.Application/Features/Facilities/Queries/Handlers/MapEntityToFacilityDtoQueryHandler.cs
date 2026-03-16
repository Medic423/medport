using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class MapEntityToFacilityDtoQueryHandler(IApplicationDbContext context) :
    IRequestHandler<MapEntityToFacilityDtoQuery, FacilityDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<FacilityDto> Handle(MapEntityToFacilityDtoQuery request, CancellationToken cancellationToken)
    {
        return new FacilityDto
        {
            Id = request.entity.Id,
            Name = request.entity.Name,
            Address = request.entity.Address,
            City = request.entity.City,
            State = request.entity.State,
            ZipCode = request.entity.ZipCode,
            Phone = request.entity?.Phone ?? "",
            Email = request.entity?.Email ?? "",
            FacilityType = request.entity.FacilityType,
            IsPrimary = request.entity.IsPrimary,
            IsActive = request.entity.IsActive,
            Latitude = request.entity.Latitude,
            Longitude = request.entity.Longitude,
            CreatedAt = request.entity.CreatedAt,
            UpdatedAt = request.entity.UpdatedAt
        };
    }
}
