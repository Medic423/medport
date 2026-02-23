using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Agencies.Commands.Requests;
using Medport.Application.Tracc.Features.Agencies.Constants;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Agencies.Queries.Requests;
using Medport.Application.Tracc.Features.Hospitals.Constants;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class AgencyController : ApiControllerBase
{
    [HttpGet("transport-requests/{agencyId}")]
    public async Task<ActionResult> GetTransportRequest(Guid agencyId,CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetAgencyTransportQuery(agencyId), cancellationToken));
    }

    [HttpPost("/transport-requests/{agencyId}/accept")]
    public async Task<ActionResult> AcceptTransportRequet(
        Guid agencyId, 
        [FromBody] AcceptAgencyTransportCommand command, 
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(command,cancellationToken);

        var response = ApiResponse<AgencyDto>.Ok(data, AgencyConstants.GenericMessages.AcceptedSuccessfully);

        return Ok(response);
    }

    [HttpPost("/transport-requests/{agencyId}/reject")]
    public async Task<ActionResult> RejectTransportRequet(
        Guid agencyId,
        [FromBody] RejectAgencyTransportCommand command,
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<AgencyDto>.Ok(data, AgencyConstants.GenericMessages.RejectedSuccessfully);

        return Ok(response);
    }
}
