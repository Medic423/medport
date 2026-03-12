using MediatR;
using Medport.Application.Tracc.Common.Enums;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class ResetPasswordCommandHandler(IApplicationDbContext context) : IRequestHandler<ResetPasswordCommand, string>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<string> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // Todo - return dto here
        // Also probably want to send email or 2fa with this instead of returning the password to the user 

        var tempPassword = GenerateTempPassword();
        var hasher = new PasswordHasher<object>();
        var hashed = hasher.HashPassword(null, tempPassword);

        var user = await _context.Users.FindAsync([request.Id], cancellationToken);

        if (user == null) 
            return "Could not update password at this time";

        user.Password = hashed;

        if (
            request.Domain == UserTypeEnum.EMS_ORGANIZATION_USER.ToString() ||
            request.Domain == UserTypeEnum.HEALTHCARE_ORGANIZATION_USER.ToString()
        )
        {
            user.MustChangePassword = true;
            user.IsActive = true;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return tempPassword;
    }

    private static string GenerateTempPassword()
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
}
