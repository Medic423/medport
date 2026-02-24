using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/ems/analytics")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class EMSAnalyticsController : ApiControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult> GetOverview([FromQuery] GetEmsOverviewQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);
        return Ok(ApiResponse<EmsOverviewDto>.Ok(data));
    }

    [HttpGet("trips")]
    public async Task<ActionResult> GetTrips([FromQuery] GetEmsTripsQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);
        return Ok(ApiResponse<EmsTripsDto>.Ok(data));
    }

    [HttpGet("units")]
    public async Task<ActionResult> GetUnits([FromQuery] GetEmsUnitsQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);
        return Ok(ApiResponse<EmsUnitsDto>.Ok(data));
    }

    [HttpGet("performance")]
    public async Task<ActionResult> GetPerformance([FromQuery] GetEmsPerformanceQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);
        return Ok(ApiResponse<EmsPerformanceDto>.Ok(data));
    }
}
