using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Handlers;

public class DeleteEmsSubUserCommandHandler : IRequestHandler<DeleteEmsSubUserCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteEmsSubUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteEmsSubUserCommand request, CancellationToken cancellationToken)
    {
        if (request.CallerUserType != "EMS" && request.CallerUserType != "ADMIN")
            throw new UnauthorizedAccessException("Forbidden");

        var sub = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        if (sub == null) throw new InvalidOperationException("Sub-user not found");

        if (request.CallerUserType == "EMS")
        {
            var parent = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
            if (parent == null || sub.ParentUserId != parent.Id) throw new UnauthorizedAccessException("Forbidden");
        }

        _context.EmsUsers.Remove(sub);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
