using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Features.Agencies.Commands.Requests;
using Medport.Application.Tracc.Features.Agencies.Queries.Requests;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
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
    [HttpGet("transport-requests")]
    public async Task<ActionResult<HospitalDto>> GetTransportRequest(CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetAgencyTransportQuery(), cancellationToken));
    }

    [HttpPost("/transport-requests/{agencyId}/accept")]
    public async Task<ActionResult<HospitalDto>> AcceptTransportRequet(Guid agencyId, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new AcceptAgencyTransportCommand(agencyId), cancellationToken));
    }

    [HttpPost("/transport-requests/{agencyId}/reject")]
    public async Task<ActionResult<HospitalDto>> RejectTransportRequet(Guid agencyId, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new RejectAgencyTransportCommand(agencyId), cancellationToken));
    }

}
