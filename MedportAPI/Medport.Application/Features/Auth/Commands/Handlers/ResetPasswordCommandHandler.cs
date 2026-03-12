using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, string>
{
    private readonly IApplicationDbContext _context;

    public ResetPasswordCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    private string GenerateTempPassword()
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        var all = upper + lower + digits;
        var rnd = new Random();
        var outp = new System.Text.StringBuilder();
        outp.Append(upper[rnd.Next(upper.Length)]);
        outp.Append(lower[rnd.Next(lower.Length)]);
        outp.Append(digits[rnd.Next(digits.Length)]);
        for (int i = 0; i < 9; i++) outp.Append(all[rnd.Next(all.Length)]);
        return outp.ToString();
    }

    public async Task<string> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var temp = GenerateTempPassword();
        var hasher = new PasswordHasher<object>();
        var hashed = hasher.HashPassword(null, temp);

        //if (request.Domain == "CENTER")
        //{
        //    var user = await _context.CenterUsers.FindAsync(new object[] { request.Id }, cancellationToken);
        //    if (user == null) return null;
        //    user.Password = hashed;
        //    await _context.SaveChangesAsync(cancellationToken);
        //    return temp;
        //}
        //else if (request.Domain == "HEALTHCARE")
        //{
        //    var user = await _context.HealthcareUsers.FindAsync(new object[] { request.Id }, cancellationToken);
        //    if (user == null) return null;
        //    user.Password = hashed;
        //    user.MustChangePassword = true;
        //    user.IsActive = true;
        //    await _context.SaveChangesAsync(cancellationToken);
        //    return temp;
        //}
        //else if (request.Domain == "EMS")
        //{
        //    var user = await _context.EmsUsers.FindAsync(new object[] { request.Id }, cancellationToken);
        //    if (user == null) return null;
        //    user.Password = hashed;
        //    user.MustChangePassword = true;
        //    user.IsActive = true;
        //    await _context.SaveChangesAsync(cancellationToken);
        //    return temp;
        //}

        return null;
    }
}
