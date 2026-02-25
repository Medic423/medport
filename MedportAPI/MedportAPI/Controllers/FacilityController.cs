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
public class FacilityController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAllPaginated(
            [FromQuery] Application.Tracc.Features.Facilities.Queries.Requests.GetAllFacilitiesWithPaginationQuery query,
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

        var response = ApiResponse<List<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetByIdQuery(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Application.Tracc.Features.Facilities.Queries.Requests.GetFacilityByIdQuery(id), cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] Application.Tracc.Features.Facilities.Commands.Requests.CreateFacilityCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>.Ok(data, "Facility created successfully"));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Update(Guid id, [FromBody] Application.Tracc.Features.Facilities.Commands.Requests.UpdateFacilityCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>.Ok(data, "Facility updated successfully"));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new Application.Tracc.Features.Facilities.Commands.Requests.DeleteFacilityCommand(id));

        var response = ApiResponse<object>.Ok(null, "Facility deleted successfully");

        return Ok(response);
    }
}
