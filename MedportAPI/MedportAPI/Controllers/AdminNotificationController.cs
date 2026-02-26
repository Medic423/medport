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
    #region GETS

    [HttpGet("carriers")]
    public async Task<ActionResult> GetCarriers(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetCarriersQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<object>>.Ok(data));
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

    [HttpGet("sms-stats")]
    public async Task<ActionResult> GetSmsStats(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default
    )
    {
        // TODO - Add Authentication Admin Check
        // Check if user is admin
        //if (req.user?.userType !== 'ADMIN')
        //{
        //    return res.status(403).json({
        //    success: false,
        //error: 'Admin access required'
        //    });
        //}

        var data = await Mediator.Send(new GetSmsStatsQuery(days), cancellationToken);

        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetStatsQuery(
        int days, 
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(new GetStatsQuery(days), cancellationToken);
        return Ok(ApiResponse<MessageStatsDto>.Ok(data));
    }

    [HttpGet("templates")]
    public async Task<ActionResult> GetTemplates(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetTemplatesQuery(), cancellationToken);
        return Ok(ApiResponse<TemplatesDto>.Ok(data));
    }

    [HttpGet("users")]
    public async Task<ActionResult> GetUsers(
        [FromQuery] string userType,
        [FromQuery] int limit = 100,
        CancellationToken cancellationToken = default
    )
    {
        var data = await Mediator.Send(new GetUsersQuery(userType, limit), cancellationToken);
        return Ok(ApiResponse<IEnumerable<NotificationUserDto>>.Ok(data));
    }

    #endregion


    #region POSTS

    [HttpPost("broadcast")]
    public async Task<ActionResult> Broadcast(
        [FromBody] SendBroadcastCommand command,
        CancellationToken cancellationToken
    )
    {
        // TODO - Add Authentication Admin Check
        // Check if user is admin
        //if (req.user?.userType !== 'ADMIN')
        //{
        //    return res.status(403).json({
        //    success: false,
        //error: 'Admin access required'
        //    });
        //}

        var data = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<BroadcastResultDto>.Ok(
            data, 
            $"Broadcast sent to ${data.Successful} users, ${data.Failed} failed"
        );
        
        return Ok(response);
    }


    [HttpPost("test-system")]
    public async Task<ActionResult> TestSystem(
        [FromBody] TestNotificationSystemCommand command,
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<TestSystemResultDto>.Ok(data));
    }

    #endregion
}
