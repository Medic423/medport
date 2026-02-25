using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using System.Collections.Generic;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class HealthcareSubUserController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.HealthcareSubUserDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var callerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;
        var callerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;

        var data = await Mediator.Send(new Application.Tracc.Features.HealthcareSubUsers.Queries.Requests.GetHealthcareSubUsersQuery { CallerEmail = callerEmail, CallerUserType = callerUserType }, cancellationToken);

        return Ok(ApiResponse<IEnumerable<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.HealthcareSubUserDto>>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.CreateHealthcareSubUserResultDto>>> Create([FromBody] Application.Tracc.Features.HealthcareSubUsers.Commands.Requests.CreateHealthcareSubUserCommand command, CancellationToken cancellationToken)
    {
        command.CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;
        command.CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;

        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.CreateHealthcareSubUserResultDto>.Ok(data));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ApiResponse<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.HealthcareSubUserDto>>> Update(Guid id, [FromBody] Application.Tracc.Features.HealthcareSubUsers.Commands.Requests.UpdateHealthcareSubUserCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        command.CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;
        command.CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;

        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.HealthcareSubUserDto>.Ok(data));
    }

    [HttpPost("{id}/reset-temp-password")]
    public async Task<ActionResult<ApiResponse<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.ResetHealthcareSubUserResultDto>>> ResetTempPassword(Guid id, CancellationToken cancellationToken)
    {
        var command = new Application.Tracc.Features.HealthcareSubUsers.Commands.Requests.ResetHealthcareSubUserPasswordCommand
        {
            Id = id,
            CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value,
            CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value
        };

        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos.ResetHealthcareSubUserResultDto>.Ok(data));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var command = new Application.Tracc.Features.HealthcareSubUsers.Commands.Requests.DeleteHealthcareSubUserCommand
        {
            Id = id,
            CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value,
            CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value
        };

        await Mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<string>.Ok(null, "Sub-user deleted"));
    }
}
