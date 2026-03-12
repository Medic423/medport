using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Handlers;

public class DeleteAgencyForHealthcareUserCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteAgencyForHealthcareUserCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteAgencyForHealthcareUserCommand request, CancellationToken cancellationToken)
    {
        //var entity = await _context.EmsAgencies.FirstOrDefaultAsync(a => a.Id == request.Id && a.AddedBy == request.HealthcareUserId, cancellationToken);
        //if (entity == null)
        //{

        //}

        //// Soft delete
        //entity.IsActive = false;
        //await _context.SaveChangesAsync(cancellationToken);

        return;

    }
}
