using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class HealthcareLocationController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAllPaginated(
            [FromQuery] GetAllHealthcareLocationsWithPaginationQuery query,
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

        var response = ApiResponse<List<HealthcareLocationDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpGet("{Id}")]
    public async Task<ActionResult<ApiResponse<HealthcareLocationDto>>> GetByIdQuery(
        Guid Id, 
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(new GetHealthcareLocationsByIdQuery(Id), cancellationToken);

        return Ok(ApiResponse<HealthcareLocationDto>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] CreateHealthcareLocationCommand command, 
        CancellationToken cancellationToken
    )
    {
        var data = await Mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<HealthcareLocationDto>.Ok(data, "Location created successfully"));
    }

    [HttpPut("{Id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Update(
        [FromRoute] Guid Id,
        [FromBody] UpdateHealthcareLocationCommand command, 
        CancellationToken cancellationToken
    )
    {
        command.Id = Id;

        var data = await Mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<HealthcareLocationDto>.Ok(data, "Location updated successfully"));
    }

    [HttpDelete("{Id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid Id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteHealthcareLocationCommand(Id), cancellationToken);

        return Ok(ApiResponse<HealthcareLocationDto>.Ok(null, "Location deleted successfully"));
    }

    [HttpGet("all")]
    public async Task<ActionResult> GetAllForAdmin(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Application.Tracc.Features.Facilities.Queries.Requests.GetAllFacilitiesWithPaginationQuery { Page = 0, Limit = int.MaxValue }, cancellationToken);
        return Ok(ApiResponse<List<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>>.Ok([.. data.Items]));
    }

    [HttpGet("active")]
    public async Task<ActionResult> GetActive(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Application.Tracc.Features.Facilities.Queries.Requests.GetAllFacilitiesWithPaginationQuery { Page = 0, Limit = int.MaxValue, IsActive = true }, cancellationToken);
        return Ok(ApiResponse<List<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>>.Ok([.. data.Items]));
    }

    [HttpGet("statistics")]
    public async Task<ActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        // Simple statistics: total locations and active count
        var all = await Mediator.Send(new Application.Tracc.Features.Facilities.Queries.Requests.GetAllFacilitiesWithPaginationQuery { Page = 0, Limit = int.MaxValue }, cancellationToken);
        var total = all.TotalCount;
        var active = all.Items.Count(i => i.IsActive);

        var stats = new { Total = total, Active = active };

        return Ok(ApiResponse<object>.Ok(stats));
    }

    [HttpPut("{id}/set-primary")]
    public async Task<ActionResult> SetPrimary(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new Application.Tracc.Features.Facilities.Commands.Requests.SetPrimaryFacilityCommand(id), cancellationToken);
        return Ok(ApiResponse<object>.Ok(null, "Primary location set"));
    }

    [HttpPut("{id}/admin")]
    public async Task<ActionResult> AdminUpdate(Guid id, [FromBody] Application.Tracc.Features.Facilities.Commands.Requests.AdminUpdateFacilityCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Application.Tracc.Features.Facilities.Queries.Dtos.FacilityDto>.Ok(data, "Location updated by admin"));
    }
}
