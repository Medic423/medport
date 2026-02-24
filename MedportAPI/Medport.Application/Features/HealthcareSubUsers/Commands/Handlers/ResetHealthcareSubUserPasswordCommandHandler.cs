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

public class ResetHealthcareSubUserPasswordCommandHandler : IRequestHandler<ResetHealthcareSubUserPasswordCommand, ResetHealthcareSubUserResultDto>
{
    private readonly IApplicationDbContext _context;

    public ResetHealthcareSubUserPasswordCommandHandler(IApplicationDbContext context)
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

    public async Task<ResetHealthcareSubUserResultDto> Handle(ResetHealthcareSubUserPasswordCommand request, CancellationToken cancellationToken)
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

        var tempPassword = GenerateTempPassword();
        var hash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

        sub.Password = hash;
        sub.MustChangePassword = true;
        sub.IsActive = true;

        await _context.SaveChangesAsync(cancellationToken);

        return new ResetHealthcareSubUserResultDto { Id = sub.Id, TempPassword = tempPassword };
    }
}
