using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using Medport.Application.Tracc.Features.Optimizations.Queries.Requests;
using System.Threading;
using System.Collections.Generic;

namespace Medport.API.Tracc.Controllers;

[Route("api/optimize")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class OptimizationController : ApiControllerBase
{
    [HttpPost("routes")]
    public async Task<ActionResult> OptimizeRoutes([FromBody] OptimizeRoutesCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("revenue")]
    public async Task<ActionResult> GetRevenue([FromQuery] string timeframe = "24h", CancellationToken cancellationToken = default)
    {
        // Simplified revenue endpoint
        return Ok(ApiResponse<object>.Ok(new { timeframe, totalTrips = 0, message = "Simplified revenue endpoint" }));
    }

    [HttpPost("backhaul")]
    public async Task<ActionResult> Backhaul([FromBody] BackhaulQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("return-trips")]
    public async Task<ActionResult> ReturnTrips(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new ReturnTripsQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpPost("multi-unit")]
    public async Task<ActionResult> MultiUnit([FromBody] MultiUnitOptimizeCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("performance")]
    public async Task<ActionResult> Performance([FromQuery] string timeframe = "24h", [FromQuery] string unitId = null, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetPerformanceQuery(timeframe, unitId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("settings")]
    public async Task<ActionResult> GetSettings([FromQuery] string agencyId, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetSettingsQuery(agencyId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpPost("settings")]
    public async Task<ActionResult> UpsertSettings([FromBody] UpsertSettingsCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpPost("settings/reset")]
    public async Task<ActionResult> ResetSettings([FromBody] ResetSettingsCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpPost("preview")]
    public async Task<ActionResult> Preview([FromBody] PreviewOptimizationCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpPost("what-if")]
    public async Task<ActionResult> WhatIf([FromBody] WhatIfCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }
}
