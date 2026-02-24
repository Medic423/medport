using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using System.Collections.Generic;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class EMSSubUsersController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.EmsSubUserDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var callerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;
        var callerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;

        var data = await Mediator.Send(new Medport.Application.Tracc.Features.EMSSubUsers.Queries.Requests.GetEmsSubUsersQuery { CallerEmail = callerEmail, CallerUserType = callerUserType }, cancellationToken);

        return Ok(ApiResponse<IEnumerable<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.EmsSubUserDto>>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.CreateEmsSubUserResultDto>>> Create([FromBody] Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests.CreateEmsSubUserCommand command, CancellationToken cancellationToken)
    {
        command.CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;
        command.CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;

        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.CreateEmsSubUserResultDto>.Ok(data));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ApiResponse<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.EmsSubUserDto>>> Update(Guid id, [FromBody] Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests.UpdateEmsSubUserCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        command.CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;
        command.CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;

        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.EmsSubUserDto>.Ok(data));
    }

    [HttpPost("{id}/reset-temp-password")]
    public async Task<ActionResult<ApiResponse<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.ResetEmsSubUserResultDto>>> ResetTempPassword(Guid id, CancellationToken cancellationToken)
    {
        var command = new Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests.ResetEmsSubUserPasswordCommand
        {
            Id = id,
            CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value,
            CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value
        };

        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos.ResetEmsSubUserResultDto>.Ok(data));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var command = new Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests.DeleteEmsSubUserCommand
        {
            Id = id,
            CallerEmail = User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value,
            CallerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value
        };

        await Mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<string>.Ok(null, "Sub-user deleted"));
    }
}
