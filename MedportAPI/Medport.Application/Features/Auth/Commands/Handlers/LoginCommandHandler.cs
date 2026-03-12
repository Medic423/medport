using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Application.Tracc.Features.Auth.Helpers.Intefaces;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class LoginCommandHandler(
    IApplicationDbContext context, 
    IConfiguration configuration,
    IAuthenticationHelper authenticationHelper
) : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;
    private readonly IAuthenticationHelper _authenticationHelper = authenticationHelper;

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        (string email, string password) = _authenticationHelper.DecodeAuth(request.EncodedAuth);

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
        var foundUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (foundUser != null)
            return await ValidateUser(foundUser, password, cancellationToken);

        return LoginResult.Fail("No account found with this email address.");
    }

    private async Task<LoginResult> ValidateUser(
        User user,
        string password,
        CancellationToken cancellationToken
    )
    {
        if (!VerifyPassword(user,user.Password, password))
            return LoginResult.Fail("Invalid password.");

        if (user.IsDeleted)
            return LoginResult.Fail("This account has been deleted.");

        if (!user.IsActive)
            return LoginResult.Fail("This account has been deactivated.");

        user.LastLogin = DateTime.UtcNow;
        user.LastActivity = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        return LoginResult.Success(user, user.Id, user.UserType, false);
    }

    private static bool VerifyPassword(User user,string hashedPassword, string password)
    {
        var hasher = new PasswordHasher<object>();
        var result = hasher.VerifyHashedPassword(user, hashedPassword, password);

        return result != PasswordVerificationResult.Failed;
    }

    private string GenerateToken(string email, string userType, Guid userId)
    {
        var jwtSecret = _configuration["JWT_SECRET"]
                   ?? _configuration["Jwt:Secret"]
                   ?? Environment.GetEnvironmentVariable("JWT_SECRET");

        var key = Encoding.ASCII.GetBytes(jwtSecret);
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

    private static UserDto BuildUserDto(User user, string email, string userType)
    {
        var dto = new UserDto
        {
            Id = user.Id,
            Email = email,
            UserType = userType,
            Name = user.Name,
            OrganizationId = user.OrganizationId
        };

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
    public User? User { get; private set; }
    public Guid UserId { get; private set; }
    public string UserType { get; private set; } = "";
    public bool MustChangePassword { get; private set; }

    public static LoginResult Fail(string message)
        => new() { Succeed = false, Message = message };

    public static LoginResult Success(User user, Guid id, string type, bool mustChange)
        => new()
        {
            Succeed = true,
            User = user,
            UserId = id,
            UserType = type,
            MustChangePassword = mustChange
        };
}