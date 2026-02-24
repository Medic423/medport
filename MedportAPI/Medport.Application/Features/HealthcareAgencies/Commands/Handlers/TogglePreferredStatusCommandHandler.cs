using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;
using Medport.Domain.Interfaces;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Handlers;

public class TogglePreferredStatusCommandHandler : IRequestHandler<TogglePreferredStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public TogglePreferredStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(TogglePreferredStatusCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.HealthcareAgencyPreferences.FirstOrDefaultAsync(p => p.HealthcareUserId == request.HealthcareUserId && p.PreferredAgencyId == request.AgencyId, cancellationToken);

        if (request.IsPreferred)
        {
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
            else if (!existing.IsActive)
            {
                existing.IsActive = true;
                await _context.SaveChangesAsync(cancellationToken);
            }

            return true;
        }
        else
        {
            if (existing != null)
            {
                _context.HealthcareAgencyPreferences.Remove(existing);
                await _context.SaveChangesAsync(cancellationToken);
            }
            return true;
        }
    }
}
