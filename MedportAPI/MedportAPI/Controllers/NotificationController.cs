using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Features.Notifications.Queries.Requests;
using Medport.Application.Tracc.Features.Notifications.Commands.Requests;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;
using System.Threading;
using System.Collections.Generic;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class NotificationController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDto>>>> GetNotifications(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetNotificationsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<NotificationDto>>.Ok(data));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<object>>> MarkRead([FromRoute] string id, CancellationToken cancellationToken)
    {
        var success = await Mediator.Send(new MarkNotificationReadCommand(id), cancellationToken);
        if (!success) return NotFound(ApiResponse<object>.Fail("Notification not found"));
        return Ok(ApiResponse<object>.Ok(null, "Notification marked as read"));
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAllRead(CancellationToken cancellationToken)
    {
        var count = await Mediator.Send(new MarkAllNotificationsReadCommand(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { count }, "Notifications marked as read"));
    }

    [HttpPost("test")]
    public async Task<ActionResult<ApiResponse<object>>> CreateTest([FromBody] CreateTestNotificationCommand command, CancellationToken cancellationToken)
    {
        var id = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { id }, "Test notification created"));
    }

    [HttpGet("preferences")]
    public async Task<ActionResult<ApiResponse<NotificationPreferencesDto>>> GetPreferences(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetNotificationPreferencesQuery(), cancellationToken);
        return Ok(ApiResponse<NotificationPreferencesDto>.Ok(data));
    }

    [HttpPut("preferences")]
    public async Task<ActionResult<ApiResponse<NotificationPreferencesDto>>> UpdatePreferences([FromBody] UpdateNotificationPreferencesCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<NotificationPreferencesDto>.Ok(data));
    }

    [HttpGet("log")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetLog([FromQuery] int days = 30, [FromQuery] int limit = 50, CancellationToken cancellationToken = default)
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var data = await Mediator.Send(new GetNotificationLogQuery(userId ?? string.Empty, days, limit), cancellationToken);
        return Ok(ApiResponse<IEnumerable<object>>.Ok(data));
    }

    [HttpPost("send")]
    public ActionResult<ApiResponse<object>> SendNotification()
    {
        return StatusCode(501, ApiResponse<object>.Fail("Send notification not implemented on server"));
    }

    [HttpPost("test-email")]
    public ActionResult<ApiResponse<object>> TestEmail()
    {
        return StatusCode(501, ApiResponse<object>.Fail("Test email not implemented"));
    }

    [HttpPost("test-sms")]
    public ActionResult<ApiResponse<object>> TestSms()
    {
        return StatusCode(501, ApiResponse<object>.Fail("Test sms not implemented"));
    }

    [HttpGet("stats")]
    public ActionResult<ApiResponse<object>> GetStats()
    {
        return StatusCode(501, ApiResponse<object>.Fail("Notification stats not implemented"));
    }

    [HttpGet("status")]
    public ActionResult<ApiResponse<object>> GetStatus()
    {
        return StatusCode(501, ApiResponse<object>.Fail("Notification service status not implemented"));
    }
}
