using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Handlers;

public class HardDeletePickupLocationCommandHandler(IApplicationDbContext context) : IRequestHandler<HardDeletePickupLocationCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(HardDeletePickupLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PickupLocations.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (entity == null)
        {

        }

        _context.PickupLocations.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
