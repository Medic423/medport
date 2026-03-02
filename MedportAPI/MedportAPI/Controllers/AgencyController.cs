using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Agencies.Commands.Requests;
using Medport.Application.Tracc.Features.Agencies.Constants;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Agencies.Queries.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

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
        HttpContext.Request.Headers.TryGetValue("Authorization", out var authorizationHeader);
        
        bool isDemo = authorizationHeader == "Bearer demo-agency-token";

        var response = await Mediator.Send(new GetAgencyTransportQuery(agencyId, isDemo), cancellationToken);

        return Ok(response);
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

    //TODO Add agencies endpoints here 
}
