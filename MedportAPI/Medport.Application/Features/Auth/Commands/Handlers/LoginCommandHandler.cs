using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class LoginCommandHandler(IApplicationDbContext context) : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly string _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email?.Trim();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            // TODO Throw Exception
            return null;
        }

        string userType = string.Empty;
        Guid userId = Guid.Empty;
        bool wasFound = false;
        bool isCenterUser = false;
        bool isHealthcareUser = false;
        bool isEmsUser = false;
        
        CenterUser? centerUser = null;
        EmsUser? emsUser = null;
        HealthcareUser? hcUser = null;
        bool mustChange = false;

        (wasFound, userType, centerUser) = await CenterUserLogin(email,password,cancellationToken);
        if (wasFound)
        {
            isCenterUser = true;
        }
        else
        {
            (wasFound, mustChange, userType, hcUser) = await HealthcareUsersLogin(email, password, cancellationToken);

            if (wasFound)
            {
                isHealthcareUser = true;
            }
            else 
            {
                (wasFound, mustChange, userType, emsUser) = await EMSUserLogin(email, password, cancellationToken);
                
                if (wasFound)
                {
                    isEmsUser = true;
                }
            }
        }

        if (
            (isCenterUser && centerUser == null) ||
            (isHealthcareUser && hcUser == null) ||
            (isEmsUser && emsUser == null)
        )
        {
            // TODO Throw new exception
            return null;
        }

        var token = GenerateToken(email,userType,userId);

        var user = isCenterUser ? (object)centerUser : isHealthcareUser ? (object)hcUser : (object)emsUser;

        var dtoUser = BuildUserDto(
            user,
            email,
            userType
        );

        return new AuthResultDto { 
            User = dtoUser, 
            Token = token, 
            MustChangePassword = mustChange 
        };
    }

    private async Task<(bool, string, CenterUser?)> CenterUserLogin(
        string email,
        string password,
        CancellationToken cancellationToken
    )
    {
        var centerUser = await _context.CenterUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        bool wasFound = false;

        if (centerUser != null)
        {
            wasFound = true;

            var passwordHasher = new PasswordHasher<object>();
            var userType = centerUser.UserType;
            var userUserId = centerUser.Id;

            var verify = passwordHasher.VerifyHashedPassword(null, centerUser.Password, password);

            if (verify == PasswordVerificationResult.Failed)
            {
                // TODO Throw Exception
                return (wasFound, "", null);
            }

            // update last login
            centerUser.LastLogin = DateTime.UtcNow;
            centerUser.LastActivity = DateTime.UtcNow;
            _context.CenterUsers.Update(centerUser);

            await _context.SaveChangesAsync(cancellationToken);

            return (wasFound, userType, centerUser);
        }

        return (wasFound, string.Empty, null);
    }

    private async Task<(bool, bool, string, HealthcareUser?)> HealthcareUsersLogin(
        string email,
        string password,
        CancellationToken cancellationToken
    )
    {
        var hcUser = await _context.HealthcareUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        bool wasFound = false;

        if (hcUser != null)
        {
            wasFound = true;

            var passwordHasher = new PasswordHasher<object>();
            var userType = "HEALTHCARE";
            var userUserId = hcUser.Id;
            var mustChange = false;

            var verify = passwordHasher.VerifyHashedPassword(null, hcUser.Password, password);

            if (verify == PasswordVerificationResult.Failed)
            {
                // TODO Throw Exception
                return (wasFound, mustChange, "", null);
            }

            mustChange = hcUser.MustChangePassword;
            hcUser.LastLogin = DateTime.UtcNow;
            hcUser.LastActivity = DateTime.UtcNow;
            _context.HealthcareUsers.Update(hcUser);

            await _context.SaveChangesAsync(cancellationToken);

            return (wasFound, mustChange, userType, hcUser);
        }

        return (wasFound, false, string.Empty, null);
    }

    private async Task<(bool, bool, string, EmsUser?)> EMSUserLogin(
        string email,
        string password,
        CancellationToken cancellationToken
    )
    {
        var emsUser = await _context.EmsUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        bool wasFound = false;

        if (emsUser != null)
        {
            wasFound = true;

            var passwordHasher = new PasswordHasher<object>();
            var userType = "EMS";
            var userUserId = emsUser.Id;
            var mustChange = false;

            var verify = passwordHasher.VerifyHashedPassword(null, emsUser.Password, password);
            if (verify == PasswordVerificationResult.Failed)
            {
                // TODO Throw Exception
                return (wasFound, mustChange, "", null);
            }

            mustChange = emsUser.MustChangePassword;
            emsUser.LastLogin = DateTime.UtcNow;
            emsUser.LastActivity = DateTime.UtcNow;
            _context.EmsUsers.Update(emsUser);

            await _context.SaveChangesAsync(cancellationToken);

            return (wasFound, mustChange, userType, emsUser);
        }

        return (wasFound, false, string.Empty, null);
    }

    private string GenerateToken(string email, string userType, Guid userId)
    {
        // Generate JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);

        var claims = new Claim[] {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, email),
            new("userType", userType)
        };
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
    }

    private static UserDto BuildUserDto<T>(T user, string email, string userType)
    {
        var dto = new UserDto
        {
            Email = email,
            UserType = userType,
            Id = Guid.Empty,
            Name = null,
            FacilityName = null,
            ManageMultipleLocations = null,
            OrgAdmin = null,
            AgencyName = null,
            AgencyId = null
        };

        switch (user)
        {
            case HealthcareUser healthcare:
                dto.Id = healthcare.Id;
                dto.Name = healthcare.Name;
                dto.FacilityName = healthcare.FacilityName;
                dto.ManageMultipleLocations = healthcare.ManageMultipleLocations;
                dto.OrgAdmin = healthcare.OrgAdmin;
                break;

            case EmsUser ems:
                dto.Id = ems.Id;
                dto.Name = ems.Name;
                dto.AgencyName = ems.AgencyName;
                dto.AgencyId = ems.AgencyId;
                dto.OrgAdmin = ems.OrgAdmin;
                break;

            case CenterUser center:
                dto.Id = center.Id;
                dto.Name = center.Name;
                break;
        }

        return dto;
    }
}
