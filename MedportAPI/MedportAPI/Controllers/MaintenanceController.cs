using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Common.DTOs;
using Medport.Application.Tracc.Features.Maintenance.Commands.Requests;
using Medport.Application.Tracc.Features.Maintenance.Queries.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class MaintenanceController : ApiControllerBase
{
    [HttpPost("reset-dev-state")]
    public async Task<ActionResult<ApiResponse<ResetDevStateResultDto>>> ResetDevState(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new ResetDevStateCommand(), cancellationToken);
        return Ok(ApiResponse<ResetDevStateResultDto>.Ok(data));
    }
}
