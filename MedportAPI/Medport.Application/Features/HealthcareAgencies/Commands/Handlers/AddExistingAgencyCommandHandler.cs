using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Domain.Interfaces;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Handlers;

public class AddExistingAgencyCommandHandler : IRequestHandler<AddExistingAgencyCommand, EmsAgencyDto>
{
    private readonly IApplicationDbContext _context;

    public AddExistingAgencyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsAgencyDto> Handle(AddExistingAgencyCommand request, CancellationToken cancellationToken)
    {
        var agency = await _context.EmsAgencies.AsNoTracking().FirstOrDefaultAsync(a => a.Id == request.AgencyId, cancellationToken);
        if (agency == null) return null;

        // Check for existing preference
        var existing = await _context.HealthcareAgencyPreferences.FirstOrDefaultAsync(p => p.HealthcareUserId == request.HealthcareUserId && p.PreferredAgencyId == request.AgencyId, cancellationToken);
        if (existing == null)
        {
            var pref = new HealthcareAgencyPreference
            {
                HealthcareUserId = request.HealthcareUserId,
                PreferredAgencyId = request.AgencyId,
                PreferenceOrder = 1,
                IsActive = true
            };

            _context.HealthcareAgencyPreferences.Add(pref);
            await _context.SaveChangesAsync(cancellationToken);
        }

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
            IsPreferred = true
        };
    }
}
