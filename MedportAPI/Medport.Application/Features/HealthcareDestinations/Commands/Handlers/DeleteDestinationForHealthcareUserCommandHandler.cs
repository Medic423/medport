using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Requests;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Handlers;

public class DeleteDestinationForHealthcareUserCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteDestinationForHealthcareUserCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteDestinationForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        //var entity = await _context.HealthcareDestinations.FirstOrDefaultAsync(h => h.Id == request.Id && h.HealthcareUserId == request.HealthcareUserId, cancellationToken);
        //if (entity != null)
        //{
        //    entity.IsActive = false;
        //    await _context.SaveChangesAsync(cancellationToken);
        //}
        return;

    }
}
