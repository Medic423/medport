using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Handlers;

public class UpdateHealthcareSubUserCommandHandler : IRequestHandler<UpdateHealthcareSubUserCommand, HealthcareSubUserDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateHealthcareSubUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthcareSubUserDto> Handle(UpdateHealthcareSubUserCommand request, CancellationToken cancellationToken)
    {
        //if (request.CallerUserType != "HEALTHCARE" && request.CallerUserType != "ADMIN")
        //    throw new UnauthorizedAccessException("Forbidden");

        //var sub = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        //if (sub == null) throw new InvalidOperationException("Sub-user not found");

        //if (request.CallerUserType == "HEALTHCARE")
        //{
        //    var parent = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
        //    if (parent == null || sub.ParentUserId != parent.Id) throw new UnauthorizedAccessException("Forbidden");
        //}

        //if (request.Name != null) sub.Name = request.Name;
        //if (request.IsActive.HasValue) sub.IsActive = request.IsActive.Value;

        //await _context.SaveChangesAsync(cancellationToken);

        //return new HealthcareSubUserDto
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
