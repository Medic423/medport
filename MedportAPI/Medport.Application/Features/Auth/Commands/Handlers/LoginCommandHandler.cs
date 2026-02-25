using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly string _jwtSecret;

    public LoginCommandHandler(IApplicationDbContext context)
    {
        _context = context;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "fallback-secret";
    }

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email?.Trim();
        var password = request.Password;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return null;

        // Try center user
        var centerUser = await _context.CenterUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        string userType = null;
        object user = null;
        bool mustChange = false;

        var passwordHasher = new PasswordHasher<object>();

        if (centerUser != null)
        {
            userType = centerUser.UserType;
            user = centerUser;
            // Verify password - best effort using ASP.NET Identity hasher
            var verify = passwordHasher.VerifyHashedPassword(null, centerUser.Password, password);
            if (verify == PasswordVerificationResult.Failed) return null;
            // update last login
            centerUser.LastLogin = DateTime.UtcNow;
            centerUser.LastActivity = DateTime.UtcNow;
            _context.CenterUsers.Update(centerUser);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            var hcUser = await _context.HealthcareUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
            if (hcUser != null)
            {
                userType = "HEALTHCARE";
                user = hcUser;
                var verify = passwordHasher.VerifyHashedPassword(null, hcUser.Password, password);
                if (verify == PasswordVerificationResult.Failed) return null;
                mustChange = hcUser.MustChangePassword;
                hcUser.LastLogin = DateTime.UtcNow;
                hcUser.LastActivity = DateTime.UtcNow;
                _context.HealthcareUsers.Update(hcUser);
                await _context.SaveChangesAsync(cancellationToken);
            }
            else
            {
                var emsUser = await _context.EmsUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
                if (emsUser != null)
                {
                    userType = "EMS";
                    user = emsUser;
                    var verify = passwordHasher.VerifyHashedPassword(null, emsUser.Password, password);
                    if (verify == PasswordVerificationResult.Failed) return null;
                    mustChange = emsUser.MustChangePassword;
                    emsUser.LastLogin = DateTime.UtcNow;
                    emsUser.LastActivity = DateTime.UtcNow;
                    _context.EmsUsers.Update(emsUser);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
        }

        if (user == null) return null;

        // Generate JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);
        var claims = new Claim[] {
            new Claim(ClaimTypes.NameIdentifier, user is dynamic ? ((dynamic)user).Id.ToString() : string.Empty),
            new Claim(ClaimTypes.Email, email),
            new Claim("userType", userType)
        };
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));

        var dtoUser = new UserDto
        {
            Id = (Guid)(user is dynamic ? ((dynamic)user).Id : Guid.Empty),
            Email = email,
            Name = (user is dynamic ? ((dynamic)user).Name : null),
            UserType = userType,
            FacilityName = userType == "HEALTHCARE" ? ((dynamic)user).FacilityName : null,
            AgencyName = userType == "EMS" ? ((dynamic)user).AgencyName : null,
            AgencyId = userType == "EMS" ? ((dynamic)user).AgencyId as Guid? : null,
            ManageMultipleLocations = userType == "HEALTHCARE" ? ((dynamic)user).ManageMultipleLocations as bool? : null,
            OrgAdmin = userType == "HEALTHCARE" || userType == "EMS" ? ((dynamic)user).OrgAdmin as bool? : null
        };

        return new AuthResultDto { User = dtoUser, Token = token, MustChangePassword = mustChange };
    }
}
