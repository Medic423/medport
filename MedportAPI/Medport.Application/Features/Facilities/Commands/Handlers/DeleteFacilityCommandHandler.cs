using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class DeleteFacilityCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteFacilityCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteFacilityCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.HealthcareLocations.FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);
        if (entity != null)
        {
            _context.HealthcareLocations.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
