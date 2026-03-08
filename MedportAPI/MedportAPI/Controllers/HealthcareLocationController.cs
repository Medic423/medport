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

    
    [HttpGet("{healthcareUserId}/active")]
    public async Task<ActionResult<ApiResponse<List<HealthcareLocationDto>>>> GetHealthcareLocations(
        [FromRoute] Guid healthcareUserId,
        CancellationToken cancellationToken
    )
    {
        var healthcareLocations = await Mediator.Send(
                new GetHealthcareLocationsQuery
                {
                    HealthcareUserId = healthcareUserId
                },
                cancellationToken
            );

        return Ok(ApiResponse<List<HealthcareLocationDto>>.Ok([.. healthcareLocations]));
    }

    [HttpGet("{healthcareUserId}/statistics")]
    public async Task<ActionResult<List<HealthcareLocationStatisticsDto>>> GetStatistics(
        [FromRoute] Guid healthcareUserId,
        CancellationToken cancellationToken
    )
    {
        var stats = await Mediator.Send(new GetHealthcareLocationStatisticsQuery(healthcareUserId), cancellationToken);

        return Ok(ApiResponse<List<HealthcareLocationStatisticsDto>>.Ok(stats));
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

    [HttpPut("{Id}/admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult<ApiResponse<HealthcareLocationDto>>> UpdateHealthcareLocationAdmin(
        [FromRoute] Guid Id,
        [FromBody] AdminUpdateHealthcareLocationCommand command,
        CancellationToken cancellationToken
    )
    {
        command.Id = Id;

        var data = await Mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<HealthcareLocationDto>.Ok(data));
    }

    [HttpDelete("{Id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid Id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteHealthcareLocationCommand(Id), cancellationToken);

        return Ok(ApiResponse<HealthcareLocationDto>.Ok(null, "Location deleted successfully"));
    }

    
    [HttpPut("{Id}/set-primary")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult<ApiResponse<HealthcareLocationDto>>> SetPrimary(
        [FromRoute] Guid Id,
        [FromBody] SetPrimaryHealthcareLocationCommand command,
        CancellationToken cancellationToken
    )
    {
        command.Id = Id;

        var healthcareLocationDto = await Mediator.Send(command, cancellationToken);
        
        return Ok(ApiResponse<HealthcareLocationDto>.Ok(healthcareLocationDto, "Primary location set"));
    }

}
