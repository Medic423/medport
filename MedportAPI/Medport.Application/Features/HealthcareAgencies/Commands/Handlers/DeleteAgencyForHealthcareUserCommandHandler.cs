using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Handlers;

public class DeleteAgencyForHealthcareUserCommandHandler : IRequestHandler<DeleteAgencyForHealthcareUserCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteAgencyForHealthcareUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteAgencyForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.EmsAgencies.FirstOrDefaultAsync(a => a.Id == request.Id && a.AddedBy == request.HealthcareUserId, cancellationToken);
        if (entity == null) return Unit.Value;

        // Soft delete
        entity.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
