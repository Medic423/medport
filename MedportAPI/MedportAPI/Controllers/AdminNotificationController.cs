using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]/notifications")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class AdminNotificationController : ApiControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<MessageStatsDto>>> GetStatsQuery(int days, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetStatsQuery(days), cancellationToken);
        return Ok(ApiResponse<MessageStatsDto>.Ok(data));
    }

    [HttpPost("broadcast")]
    public async Task<ActionResult<ApiResponse<BroadcastResultDto>>> Broadcast([FromBody] SendBroadcastCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<BroadcastResultDto>.Ok(data));
    }

    [HttpGet("templates")]
    public async Task<ActionResult<ApiResponse<TemplatesDto>>> GetTemplates(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetTemplatesQuery(), cancellationToken);
        return Ok(ApiResponse<TemplatesDto>.Ok(data));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<IEnumerable<NotificationUserDto>>>> GetUsers([FromQuery] string userType, [FromQuery] int limit = 100, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetUsersQuery(userType, limit), cancellationToken);
        return Ok(ApiResponse<IEnumerable<NotificationUserDto>>.Ok(data));
    }

    [HttpGet("sms-stats")]
    public async Task<ActionResult<ApiResponse<object>>> GetSmsStats([FromQuery] int days = 30, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetSmsStatsQuery(days), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("carriers")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetCarriers(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetCarriersQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<object>>.Ok(data));
    }

    [HttpPost("test-system")]
    public async Task<ActionResult<ApiResponse<TestSystemResultDto>>> TestSystem(
        [FromBody] TestNotificationSystemCommand command, 
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<TestSystemResultDto>.Ok(data));
    }

    [HttpGet("logs")]
    public async Task<ActionResult> GetLogs(
        [FromBody] GetLogsQuery query,
        CancellationToken cancellationToken = default
    )
    {
        var data = await Mediator.Send(query, cancellationToken);

        var response = ApiResponse<IEnumerable<object>>.Ok(data);

        return Ok(response);
    }
}
