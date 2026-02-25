using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/healthcare/destinations")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class HealthcareDestinationController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAllForHealthcareUser([FromQuery] Application.Tracc.Features.HealthcareDestinations.Queries.Requests.GetAllDestinationsForHealthcareUserQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);

        var pagination = new PaginationDto
        {
            Limit = query.Limit,
            Page = query.Page,
            TotalPages = data.TotalPages,
            Total = data.TotalCount
        };

        var response = ApiResponse<List<Application.Tracc.Features.HealthcareDestinations.Queries.Dtos.HealthcareDestinationDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] Guid healthcareUserId, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Application.Tracc.Features.HealthcareDestinations.Queries.Requests.GetDestinationByIdForHealthcareUserQuery(id, healthcareUserId), cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.HealthcareDestinations.Queries.Dtos.HealthcareDestinationDto>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] Application.Tracc.Features.HealthcareDestinations.Commands.Requests.CreateDestinationForHealthcareUserCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.HealthcareDestinations.Queries.Dtos.HealthcareDestinationDto>.Ok(data, "Destination created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] Application.Tracc.Features.HealthcareDestinations.Commands.Requests.UpdateDestinationForHealthcareUserCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.HealthcareDestinations.Queries.Dtos.HealthcareDestinationDto>.Ok(data, "Destination updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, [FromQuery] Guid healthcareUserId, CancellationToken cancellationToken)
    {
        await Mediator.Send(new Application.Tracc.Features.HealthcareDestinations.Commands.Requests.DeleteDestinationForHealthcareUserCommand(id, healthcareUserId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(null, "Destination deleted successfully"));
    }
}
