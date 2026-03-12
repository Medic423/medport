using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using MediatR;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class AuthController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResultDto>>> Login(
        [FromBody] LoginCommand command, 
        CancellationToken cancellationToken
    )
    {
        var data = await _mediator.Send(command, cancellationToken);

        if (data == null) 
            return Unauthorized(ApiResponse<object>.Fail("Invalid credentials"));

        return Ok(ApiResponse<AuthResultDto>.Ok(data, "Login successful"));
    }

    [Authorize]
    [HttpPut("password/change")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var success = await _mediator.Send(command, cancellationToken);

        if (!success) return BadRequest(ApiResponse<object>.Fail("Password change failed"));
        return Ok(ApiResponse<object>.Ok(null, "Password updated successfully"));
    }

    [AllowAnonymous]
    [HttpPost("healthcare/register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> RegisterHealthcare([FromBody] CreateHealthcareCommand command, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(command, cancellationToken);
        if (data == null) return BadRequest(ApiResponse<object>.Fail("Registration failed"));
        return Created("/api/auth/healthcare", ApiResponse<UserDto>.Ok(data, "Healthcare registration successful"));
    }

    [AllowAnonymous]
    [HttpPost("ems/register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> RegisterEms([FromBody] CreateEmsCommand command, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(command, cancellationToken);
        if (data == null) return BadRequest(ApiResponse<object>.Fail("EMS registration failed"));
        return Created("/api/auth/ems", ApiResponse<UserDto>.Ok(data, "EMS registration successful"));
    }

    [Authorize]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> AdminCreateUser([FromBody] AdminCreateUserCommand command, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(command, cancellationToken);
        if (data == null) return BadRequest(ApiResponse<object>.Fail("User creation failed"));
        return Created("/api/auth/users", ApiResponse<UserDto>.Ok(data, "User created successfully"));
    }

    [Authorize]
    [HttpPost("admin/users/{domain}/{id}/reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromRoute] string domain, [FromRoute] System.Guid id, CancellationToken cancellationToken)
    {
        var cmd = new ResetPasswordCommand { Domain = domain.ToUpperInvariant(), Id = id };
        var temp = await _mediator.Send(cmd, cancellationToken);
        if (temp == null) return NotFound(ApiResponse<object>.Fail("User not found"));
        return Ok(ApiResponse<object>.Ok(new { tempPassword = temp }, "Password reset"));
    }
}
