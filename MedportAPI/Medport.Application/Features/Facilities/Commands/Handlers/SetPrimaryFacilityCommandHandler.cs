using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class SetPrimaryFacilityCommandHandler : IRequestHandler<SetPrimaryFacilityCommand>
{
    private readonly IApplicationDbContext _context;

    public SetPrimaryFacilityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(SetPrimaryFacilityCommand request, CancellationToken cancellationToken)
    {
        var facility = await _context.HealthcareLocations.FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);
        if (facility == null) return Unit.Value;

        // Unset other primary locations for same healthcare user
        var others = _context.HealthcareLocations.Where(h => h.HealthcareUserId == facility.HealthcareUserId && h.Id != facility.Id && h.IsPrimary);
        await others.ForEachAsync(h => h.IsPrimary = false, cancellationToken);

        facility.IsPrimary = true;
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
