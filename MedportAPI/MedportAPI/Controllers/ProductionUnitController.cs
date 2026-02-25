using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class ProductionUnitController : ApiControllerBase
{
    [HttpGet("tcc")]
    public async Task<ActionResult> GetTccUnits(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Application.Tracc.Features.ProductionUnits.Queries.Requests.GetTccUnitsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<Application.Tracc.Features.ProductionUnits.Queries.Dtos.ProductionUnitDto>>.Ok(data));
    }

    [HttpGet]
    public async Task<ActionResult> GetUnits(CancellationToken cancellationToken)
    {
        // For EMS consumers this endpoint is intentionally simplified and returns empty list until production integration is enabled
        return Ok(ApiResponse<IEnumerable<Application.Tracc.Features.ProductionUnits.Queries.Dtos.ProductionUnitDto>>.Ok(new List<Application.Tracc.Features.ProductionUnits.Queries.Dtos.ProductionUnitDto>()));
    }

    [HttpGet("analytics")]
    public async Task<ActionResult> GetAnalytics(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Application.Tracc.Features.ProductionUnits.Queries.Requests.GetProductionUnitAnalyticsQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(data));
    }
}
