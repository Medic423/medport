using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Requests;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Dtos;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/tcc/units")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class TCCUnitController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductionUnitDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetTccUnitsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<ProductionUnitDto>>.Ok(data));
    }

    [HttpGet("{agencyId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductionUnitDto>>>> GetByAgency(Guid agencyId, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetTccUnitsByAgencyQuery(agencyId), cancellationToken);
        return Ok(ApiResponse<IEnumerable<ProductionUnitDto>>.Ok(data));
    }

    [HttpPut("{id}")]
    public ActionResult DisabledUpdate(Guid id)
    {
        return StatusCode(410, ApiResponse<object>.Fail("TCC unit updates are disabled."));
    }

    [HttpDelete("{id}")]
    public ActionResult DisabledDelete(Guid id)
    {
        return StatusCode(410, ApiResponse<object>.Fail("TCC unit deletion is disabled."));
    }
}
