using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Constants;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
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
    public async Task<ActionResult<ApiResponse<List<FacilityDto>>>> GetAllPaginated(
            [FromQuery] GetAllFacilitiesWithPaginationQuery query,
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

        var response = ApiResponse<List<FacilityDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<FacilityDto>>> GetByIdQuery(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetFacilityByIdQuery(id), cancellationToken);
        return Ok(ApiResponse<FacilityDto>.Ok(data));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<FacilityDto>>>> SearchFacilities(
            [FromBody] SearchFacilityQuery request,
            CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(request, cancellationToken);

        var pagination = new PaginationDto
        {
            Limit = request.Limit,
            Page = request.Page,
            TotalPages = data.TotalPages,
            Total = data.TotalCount
        };

        var response = ApiResponse<List<FacilityDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<FacilityDto>>> Create(
        [FromBody] CreateFacilityCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<FacilityDto>.Ok(data, FacilityConstants.Messages.Created));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult<ApiResponse<FacilityDto>>> Update(
        [FromRoute] Guid id, 
        [FromBody] UpdateFacilityCommand command, 
        CancellationToken cancellationToken
    )
    {
        command.Id = id;

        var data = await Mediator.Send(command, cancellationToken);
        
        return Ok(ApiResponse<FacilityDto>.Ok(data, FacilityConstants.Messages.Updated));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteFacilityCommand(id));

        var response = ApiResponse<object>.Ok(null, FacilityConstants.Messages.Deleted);

        return Ok(response);
    }
}
