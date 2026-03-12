using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Handlers;

public class UpdateEmsSubUserCommandHandler : IRequestHandler<UpdateEmsSubUserCommand, EmsSubUserDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateEmsSubUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsSubUserDto> Handle(UpdateEmsSubUserCommand request, CancellationToken cancellationToken)
    {
        //if (request.CallerUserType != "EMS" && request.CallerUserType != "ADMIN")
        //    throw new UnauthorizedAccessException("Forbidden");

        //var sub = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        //if (sub == null) throw new InvalidOperationException("Sub-user not found");

        //if (request.CallerUserType == "EMS")
        //{
        //    var parent = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
        //    if (parent == null || sub.ParentUserId != parent.Id) throw new UnauthorizedAccessException("Forbidden");
        //}

        //if (request.Name != null) sub.Name = request.Name;
        //if (request.IsActive.HasValue) sub.IsActive = request.IsActive.Value;

        //await _context.SaveChangesAsync(cancellationToken);

        //return new EmsSubUserDto
        //{
        //    Id = sub.Id,
        //    Email = sub.Email,
        //    Name = sub.Name,
        //    IsActive = sub.IsActive,
        //    CreatedAt = sub.CreatedAt,
        //    UpdatedAt = sub.UpdatedAt
        //};

        return null;
    }
}
