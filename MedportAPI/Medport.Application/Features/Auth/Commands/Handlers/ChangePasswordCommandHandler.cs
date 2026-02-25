using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ChangePasswordCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var hasher = new PasswordHasher<object>();
        if (request.UserType == "ADMIN" || request.UserType == "USER")
        {
            var user = await _context.CenterUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
            if (user == null || !user.IsActive || user.IsDeleted) return false;
            var ver = hasher.VerifyHashedPassword(null, user.Password, request.CurrentPassword);
            if (ver == PasswordVerificationResult.Failed) return false;
            user.Password = hasher.HashPassword(null, request.NewPassword);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        else if (request.UserType == "HEALTHCARE")
        {
            var user = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
            if (user == null || !user.IsActive || user.IsDeleted) return false;
            var ver = hasher.VerifyHashedPassword(null, user.Password, request.CurrentPassword);
            if (ver == PasswordVerificationResult.Failed) return false;
            user.Password = hasher.HashPassword(null, request.NewPassword);
            user.MustChangePassword = false;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        else if (request.UserType == "EMS")
        {
            var user = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
            if (user == null || !user.IsActive || user.IsDeleted) return false;
            var ver = hasher.VerifyHashedPassword(null, user.Password, request.CurrentPassword);
            if (ver == PasswordVerificationResult.Failed) return false;
            user.Password = hasher.HashPassword(null, request.NewPassword);
            user.MustChangePassword = false;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        return false;
    }
}
