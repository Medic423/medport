using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Handlers;

public class GetAgencyByIdForHealthcareUserQueryHandler : IRequestHandler<GetAgencyByIdForHealthcareUserQuery, EmsAgencyDto>
{
    private readonly IApplicationDbContext _context;

    public GetAgencyByIdForHealthcareUserQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsAgencyDto> Handle(GetAgencyByIdForHealthcareUserQuery request, CancellationToken cancellationToken)
    {
        var agency = await _context.EmsAgencies
            .AsNoTracking()
            .Where(a => a.Id == request.AgencyId && a.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (agency == null) return null;

        var pref = await _context.HealthcareAgencyPreferences
            .AsNoTracking()
            .Where(p => p.HealthcareUserId == request.HealthcareUserId && p.PreferredAgencyId == agency.Id && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        return new EmsAgencyDto
        {
            Id = agency.Id,
            Name = agency.Name,
            ContactName = agency.ContactName,
            Phone = agency.Phone,
            Email = agency.Email,
            Address = agency.Address,
            City = agency.City,
            State = agency.State,
            ZipCode = agency.ZipCode,
            ServiceArea = agency.ServiceArea,
            Capabilities = agency.Capabilities,
            IsActive = agency.IsActive,
            Status = agency.Status,
            AddedBy = agency.AddedBy,
            Latitude = agency.Latitude,
            Longitude = agency.Longitude,
            AcceptsNotifications = agency.AcceptsNotifications,
            IsPreferred = pref != null
        };
    }
}
