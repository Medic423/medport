using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;
using System.Security.Claims;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/tcc/analytics")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class TccAnalyticsController : ApiControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<TccOverviewDto>>> GetOverview(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetTccOverviewQuery(), cancellationToken);
        return Ok(ApiResponse<TccOverviewDto>.Ok(data));
    }

    [HttpGet("trips")]
    public async Task<ActionResult<ApiResponse<object>>> GetTripStatistics(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetTripStatisticsQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("agencies")]
    public async Task<ActionResult<ApiResponse<object>>> GetAgencyPerformance(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetAgencyPerformanceQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("hospitals")]
    public async Task<ActionResult<ApiResponse<object>>> GetHospitalActivity(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetHospitalActivityQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("cost-breakdowns")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetCostBreakdowns([FromQuery] string tripId, [FromQuery] int limit = 100, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetTripCostBreakdownsQuery(tripId, limit), cancellationToken);
        return Ok(ApiResponse<IEnumerable<object>>.Ok(data));
    }

    [HttpPost("cost-breakdown")]
    public async Task<ActionResult<ApiResponse<object>>> CreateCostBreakdown([FromBody] Medport.Application.Tracc.Features.Analytics.Commands.Requests.CreateTripCostBreakdownCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("cost-analysis")]
    public async Task<ActionResult<ApiResponse<object>>> GetCostAnalysis([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetCostAnalysisQuery(startDate, endDate), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("profitability")]
    public async Task<ActionResult<ApiResponse<object>>> GetProfitability([FromQuery] string period = "month", CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetProfitabilityQuery(period), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("accounts")]
    public async Task<ActionResult<ApiResponse<object>>> GetAccountStatistics(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetAccountStatisticsQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("registrations")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetRecentRegistrations([FromQuery] string type, [FromQuery] int days = 60, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetRecentRegistrationsQuery(type, days), cancellationToken);
        return Ok(ApiResponse<IEnumerable<object>>.Ok(data));
    }

    [HttpGet("idle-accounts")]
    public async Task<ActionResult<ApiResponse<object>>> GetIdleAccounts([FromQuery] int days = 30, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new GetIdleAccountsQuery(days), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("active-users")]
    public async Task<ActionResult<ApiResponse<object>>> GetActiveUsers([FromQuery] int threshold = 15, [FromQuery] bool excludeCurrent = true, CancellationToken cancellationToken = default)
    {
        string excludeUserId = null;
        if (excludeCurrent)
        {
            excludeUserId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User?.FindFirst("id")?.Value;
        }

        var data = await Mediator.Send(new GetActiveUsersQuery(threshold, excludeUserId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("facilities-online")]
    public async Task<ActionResult<ApiResponse<object>>> GetFacilitiesOnline(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetFacilitiesOnlineQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }
}
