using MediatR;
using Medport.Application.Tracc.Features.PickupLocations.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.PickupLocations.Commands.Handlers;

public class DeletePickupLocationCommandHandler(IApplicationDbContext context) : IRequestHandler<DeletePickupLocationCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeletePickupLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PickupLocations.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (entity == null)
        {

        }

        // Soft delete
        entity.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
