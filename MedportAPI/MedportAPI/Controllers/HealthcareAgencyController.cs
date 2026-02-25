using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class HealthcareAgencyController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAllPaginated(
            [FromQuery] Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests.GetAgenciesForHealthcareUserQuery query,
            CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);

        var pagination = new PaginationDto
        {
            Limit = query.Limit,
            Page = query.Page,
            TotalPages = data.TotalPages,
            Total = data.TotalCount
        };

        var response = ApiResponse<List<Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos.EmsAgencyDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetByIdQuery(Guid id, CancellationToken cancellationToken)
    {
        // caller should provide healthcare user id via claims; here we'll require it as header for now
        var healthcareUserId = Guid.Empty; // controller will rely on claims in real app
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests.GetAgencyByIdForHealthcareUserQuery(id, healthcareUserId), cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos.EmsAgencyDto>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests.CreateAgencyForHealthcareUserCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos.EmsAgencyDto>.Ok(data, "Agency created successfully"));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Update(Guid id, [FromBody] Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests.UpdateAgencyForHealthcareUserCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos.EmsAgencyDto>.Ok(data, "Agency updated successfully"));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var healthcareUserId = Guid.Empty; // should come from claims
        await Mediator.Send(new Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests.DeleteAgencyForHealthcareUserCommand(id, healthcareUserId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(null, "Agency deleted successfully"));
    }
}
