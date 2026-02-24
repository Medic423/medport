using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Handlers;

public class DeletePickupLocationCommandHandler : IRequestHandler<DeletePickupLocationCommand>
{
    private readonly IApplicationDbContext _context;

    public DeletePickupLocationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeletePickupLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PickupLocations.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (entity == null) return Unit.Value;

        // Soft delete
        entity.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
