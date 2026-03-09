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
    private readonly string _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")!;

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email?.Trim();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return Fail("Must enter Email and Password");

        var loginResult = await TryLogin(email, password, cancellationToken);

        if (!loginResult.Succeed)
            return Fail(loginResult.Message);

        var token = GenerateToken(email, loginResult.UserType, loginResult.UserId);

        var dtoUser = BuildUserDto(loginResult.User!, email, loginResult.UserType);

        return new AuthResultDto
        {
            User = dtoUser,
            Token = token,
            MustChangePassword = loginResult.MustChangePassword,
            Message = string.Empty
        };
    }

    private async Task<LoginResult> TryLogin(string email, string password, CancellationToken cancellationToken)
    {
        var centerUser = await _context.CenterUsers
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (centerUser != null)
            return await ValidateCenterUser(centerUser, password, cancellationToken);

        var healthcareUser = await _context.HealthcareUsers
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (healthcareUser != null)
            return await ValidateHealthcareUser(healthcareUser, password, cancellationToken);

        var emsUser = await _context.EmsUsers
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (emsUser != null)
            return await ValidateEmsUser(emsUser, password, cancellationToken);

        return LoginResult.Fail("No account found with this email address.");
    }

    private async Task<LoginResult> ValidateCenterUser(
        CenterUser user,
        string password,
        CancellationToken cancellationToken)
    {
        if (!VerifyPassword(user.Password, password))
            return LoginResult.Fail("Invalid password.");

        if (user.IsDeleted)
            return LoginResult.Fail("This account has been deleted.");

        if (!user.IsActive)
            return LoginResult.Fail("This account has been deactivated.");

        user.LastLogin = DateTime.UtcNow;
        user.LastActivity = DateTime.UtcNow;

        _context.CenterUsers.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        return LoginResult.Success(user, user.Id, user.UserType, false);
    }

    private async Task<LoginResult> ValidateHealthcareUser(
        HealthcareUser user,
        string password,
        CancellationToken cancellationToken)
    {
        if (!VerifyPassword(user.Password, password))
            return LoginResult.Fail("Invalid password.");

        if (user.IsDeleted)
            return LoginResult.Fail("This account has been deleted.");

        if (!user.IsActive)
            return LoginResult.Fail("This account has been deactivated.");

        user.LastLogin = DateTime.UtcNow;
        user.LastActivity = DateTime.UtcNow;

        _context.HealthcareUsers.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        return LoginResult.Success(user, user.Id, "HEALTHCARE", user.MustChangePassword);
    }

    private async Task<LoginResult> ValidateEmsUser(
        EmsUser user,
        string password,
        CancellationToken cancellationToken)
    {
        if (!VerifyPassword(user.Password, password))
            return LoginResult.Fail("Invalid password.");

        if (user.IsDeleted)
            return LoginResult.Fail("This account has been deleted.");

        if (!user.IsActive)
            return LoginResult.Fail("This account has been deactivated.");

        user.LastLogin = DateTime.UtcNow;
        user.LastActivity = DateTime.UtcNow;

        _context.EmsUsers.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        return LoginResult.Success(user, user.Id, "EMS", user.MustChangePassword);
    }

    private static bool VerifyPassword(string hashedPassword, string password)
    {
        var hasher = new PasswordHasher<object>();
        var result = hasher.VerifyHashedPassword(null, hashedPassword, password);

        return result != PasswordVerificationResult.Failed;
    }

    private string GenerateToken(string email, string userType, Guid userId)
    {
        var key = Encoding.ASCII.GetBytes(_jwtSecret);
        var handler = new JwtSecurityTokenHandler();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim("userType", userType)
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        return handler.WriteToken(handler.CreateToken(descriptor));
    }

    private static UserDto BuildUserDto(object user, string email, string userType)
    {
        var dto = new UserDto
        {
            Email = email,
            UserType = userType
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

    private static AuthResultDto Fail(string message)
    {
        return new AuthResultDto
        {
            User = null,
            Token = string.Empty,
            MustChangePassword = false,
            Message = message
        };
    }
}

public class LoginResult
{
    public bool Succeed { get; private set; }
    public string Message { get; private set; } = "";
    public object? User { get; private set; }
    public Guid UserId { get; private set; }
    public string UserType { get; private set; } = "";
    public bool MustChangePassword { get; private set; }

    public static LoginResult Fail(string message)
        => new() { Succeed = false, Message = message };

    public static LoginResult Success(object user, Guid id, string type, bool mustChange)
        => new()
        {
            Succeed = true,
            User = user,
            UserId = id,
            UserType = type,
            MustChangePassword = mustChange
        };
}