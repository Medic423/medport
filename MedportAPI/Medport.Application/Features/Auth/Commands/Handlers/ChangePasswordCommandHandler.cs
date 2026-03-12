using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Medport.Application.Tracc.Common.Enums;
using Medport.Application.Tracc.Features.Auth.Helpers.Intefaces;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class ChangePasswordCommandHandler(
    IApplicationDbContext context,
    IAuthenticationHelper authenticationHelper
) : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IAuthenticationHelper _authenticationHelper = authenticationHelper;

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var hasher = new PasswordHasher<object>();

        (string email, string password) = _authenticationHelper.DecodeAuth(request.EncodedAuth);
        (string _, string newPassword) = _authenticationHelper.DecodeAuth(request.NewPasswordEncoded);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user == null || !user.IsActive || user.IsDeleted)
            return false;

        var passwordHashVerifier = hasher.VerifyHashedPassword(user, user.Password, password);

        if (passwordHashVerifier == PasswordVerificationResult.Failed)
            return false;

        user.Password = hasher.HashPassword(user, newPassword);

        if (
            request.UserType == UserTypeEnum.EMS_ORGANIZATION_USER.ToString() || 
            request.UserType == UserTypeEnum.HEALTHCARE_ORGANIZATION_USER.ToString()
        )
        {
            user.MustChangePassword = false;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
