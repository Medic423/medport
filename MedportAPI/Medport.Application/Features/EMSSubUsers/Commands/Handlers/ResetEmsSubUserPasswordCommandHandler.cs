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

public class ResetEmsSubUserPasswordCommandHandler : IRequestHandler<ResetEmsSubUserPasswordCommand, ResetEmsSubUserResultDto>
{
    private readonly IApplicationDbContext _context;

    public ResetEmsSubUserPasswordCommandHandler(IApplicationDbContext context)
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

    public async Task<ResetEmsSubUserResultDto> Handle(ResetEmsSubUserPasswordCommand request, CancellationToken cancellationToken)
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

        //var tempPassword = GenerateTempPassword();
        //var hash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

        //sub.Password = hash;
        //sub.MustChangePassword = true;
        //sub.IsActive = true;

        //await _context.SaveChangesAsync(cancellationToken);

        //return new ResetEmsSubUserResultDto { Id = sub.Id, TempPassword = tempPassword };

        return null;
    }
}
