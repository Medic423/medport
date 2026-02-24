using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Handlers;

public class DeleteHealthcareSubUserCommandHandler : IRequestHandler<DeleteHealthcareSubUserCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteHealthcareSubUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteHealthcareSubUserCommand request, CancellationToken cancellationToken)
    {
        if (request.CallerUserType != "HEALTHCARE" && request.CallerUserType != "ADMIN")
            throw new UnauthorizedAccessException("Forbidden");

        var sub = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        if (sub == null) throw new InvalidOperationException("Sub-user not found");

        if (request.CallerUserType == "HEALTHCARE")
        {
            var parent = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
            if (parent == null || sub.ParentUserId != parent.Id) throw new UnauthorizedAccessException("Forbidden");
        }

        _context.HealthcareUsers.Remove(sub);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
