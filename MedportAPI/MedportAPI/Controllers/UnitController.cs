using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Units.Commands.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Application.Tracc.Features.Units.Queries.Requests;
using Medport.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class UnitController : ApiControllerBase
{
    /// <summary>
    /// Get all units with pagination and optional filtering
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of units with pagination metadata</returns>
    [HttpGet]
    public async Task<ActionResult> GetAllPaginated(
        [FromQuery] GetAllUnitsQuery query,
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

        var response = ApiResponse<List<UnitDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    /// <summary>
    /// Get a specific unit by ID
    /// </summary>
    /// <param name="unitId">The unit ID (GUID)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Unit details</returns>
    [HttpGet("{unitId}")]
    public async Task<ActionResult> GetById(Guid unitId, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetUnitByIdQuery(unitId), cancellationToken);
        return Ok(ApiResponse<UnitDto>.Ok(data));
    }

    /// <summary>
    /// Get available units for an agency
    /// </summary>
    /// <param name="agencyId">The agency ID (GUID)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of available units</returns>
    [HttpGet("available/{agencyId}")]
    public async Task<ActionResult> GetAvailable(Guid agencyId, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetAvailableUnitsQuery(agencyId), cancellationToken);
        var response = ApiResponse<List<UnitDto>>.Ok(data);
        return Ok(response);
    }

    /// <summary>
    /// Create a new unit
    /// </summary>
    /// <param name="command">Unit creation data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created unit details</returns>
    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] CreateUnitCommand command,
        CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        var response = ApiResponse<UnitDto>.Ok(data, Constants.UnitManagement.Messages.SavedSuccesfully);
        return Ok(response);
    }

    /// <summary>
    /// Update unit details
    /// </summary>
    /// <param name="unitId">The unit ID (GUID)</param>
    /// <param name="command">Unit update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated unit details</returns>
    [HttpPut("{unitId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Update(
        Guid unitId,
        [FromBody] UpdateUnitCommand command,
        CancellationToken cancellationToken)
    {
        // Ensure the unitId in the URL matches the command
        command = command with { UnitId = unitId.ToString() };

        var data = await Mediator.Send(command, cancellationToken);
        var response = ApiResponse<UnitDto>.Ok(data, Constants.UnitManagement.Messages.UpdatedSuccesfully);
        return Ok(response);
    }

    /// <summary>
    /// Update unit status
    /// </summary>
    /// <param name="unitId">The unit ID (GUID)</param>
    /// <param name="command">Status update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated unit details</returns>
    [HttpPut("{unitId}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> UpdateStatus(
        Guid unitId,
        [FromBody] UpdateUnitStatusCommand command,
        CancellationToken cancellationToken)
    {
        // Ensure the unitId in the URL matches the command
        command = command with { UnitId = unitId.ToString() };

        var data = await Mediator.Send(command, cancellationToken);
        var response = ApiResponse<UnitDto>.Ok(data, Constants.UnitManagement.Messages.StatusUpdatedSuccesfully);
        return Ok(response);
    }

    /// <summary>
    /// Delete a unit
    /// </summary>
    /// <param name="unitId">The unit ID (GUID)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with no content</returns>
    [HttpDelete("{unitId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid unitId, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteUnitCommand(unitId.ToString()), cancellationToken);
        var response = ApiResponse<UnitDto>.Ok(null, Constants.UnitManagement.Messages.DeletedSuccesfully);
        return Ok(response);
    }
}
