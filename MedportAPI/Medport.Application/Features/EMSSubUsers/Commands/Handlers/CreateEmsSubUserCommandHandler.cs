using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System;
using BCrypt.Net;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Handlers;

public class CreateEmsSubUserCommandHandler : IRequestHandler<CreateEmsSubUserCommand, CreateEmsSubUserResultDto>
{
    private readonly IApplicationDbContext _context;

    public CreateEmsSubUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    private static string GenerateTempPassword()
    {
        var upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        var lower = "abcdefghijkmnopqrstuvwxyz";
        var digits = "23456789";
        var all = upper + lower + digits;
        var rnd = new Random();
        var outp = "";
        outp += upper[rnd.Next(upper.Length)];
        outp += lower[rnd.Next(lower.Length)];
        outp += digits[rnd.Next(digits.Length)];
        for (int i = 0; i < 9; i++) outp += all[rnd.Next(all.Length)];
        return outp;
    }

    public async Task<CreateEmsSubUserResultDto> Handle(CreateEmsSubUserCommand request, CancellationToken cancellationToken)
    {
        // Authorization: only EMS or ADMIN
        if (request.CallerUserType != "EMS" && request.CallerUserType != "ADMIN")
            throw new UnauthorizedAccessException("Forbidden");

        // Find parent
        EmsUser parent = null;
        if (request.CallerUserType == "EMS")
        {
            parent = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
            if (parent == null) throw new UnauthorizedAccessException("Parent EMS user not found");
        }
        else if (request.CallerUserType == "ADMIN")
        {
            if (string.IsNullOrEmpty(request.AgencyName)) throw new ArgumentException("agencyName is required when admin creates sub-user");
            parent = await _context.EmsUsers.FirstOrDefaultAsync(u => u.AgencyName == request.AgencyName && !u.IsSubUser, cancellationToken);
            if (parent == null) throw new InvalidOperationException($"No EMS agency found with name: {request.AgencyName}");
        }

        // Check existing
        var existing = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (existing != null) throw new InvalidOperationException("Email already in use");

        var tempPassword = GenerateTempPassword();
        var hash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

        var created = new EmsUser
        {
            Email = request.Email,
            Password = hash,
            Name = request.Name,
            AgencyName = parent.AgencyName,
            AgencyId = parent.AgencyId,
            UserType = "EMS",
            IsActive = true,
            IsSubUser = true,
            ParentUserId = parent.Id,
            MustChangePassword = true
        };

        _context.EmsUsers.Add(created);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateEmsSubUserResultDto
        {
            Id = created.Id,
            Email = created.Email,
            Name = created.Name,
            TempPassword = tempPassword
        };
    }
}
