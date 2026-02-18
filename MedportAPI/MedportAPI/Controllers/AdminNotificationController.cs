using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]/notifications")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class AdminNotificationController : ApiControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpGet("broadcast")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpGet("templates")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpGet("sms-stats")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpGet("carriers")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpGet("logs")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpPost("test-system")]
    public async Task<ActionResult<Guid>> Create(CreateShedCommand command)
    {
        return Ok(await Mediator.Send(command));
    }
}
