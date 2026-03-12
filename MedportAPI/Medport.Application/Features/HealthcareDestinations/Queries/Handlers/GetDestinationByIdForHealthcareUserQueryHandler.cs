using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Requests;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Handlers;

public class GetDestinationByIdForHealthcareUserQueryHandler : IRequestHandler<GetDestinationByIdForHealthcareUserQuery, HealthcareDestinationDto>
{
    private readonly IApplicationDbContext _context;

    public GetDestinationByIdForHealthcareUserQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthcareDestinationDto> Handle(GetDestinationByIdForHealthcareUserQuery request, CancellationToken cancellationToken)
    {
        //var destination = await _context.HealthcareDestinations
        //    .AsNoTracking()
        //    .Where(h => h.Id == request.Id && h.HealthcareUserId == request.HealthcareUserId)
        //    .Select(h => new HealthcareDestinationDto
        //    {
        //        Id = h.Id,
        //        HealthcareUserId = h.HealthcareUserId,
        //        DestinationName = h.DestinationName,
        //        Address = h.Address,
        //        City = h.City,
        //        State = h.State,
        //        ZipCode = h.ZipCode,
        //        Phone = h.Phone,
        //        Latitude = h.Latitude,
        //        Longitude = h.Longitude,
        //        FacilityType = h.FacilityType,
        //        IsActive = h.IsActive,
        //        CreatedAt = h.CreatedAt,
        //        UpdatedAt = h.UpdatedAt
        //    })
        //    .FirstOrDefaultAsync(cancellationToken);

        //return destination;

        return null;
    }
}
