using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
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
public class PickupLocationController : ApiControllerBase
{
    [HttpGet("hospital/{hospitalId}")]
    public async Task<ActionResult> GetByHospital(Guid hospitalId, [FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.PickupLocations.Queries.Requests.GetPickupLocationsByHospitalQuery { HospitalId = hospitalId, IncludeInactive = includeInactive }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos.PickupLocationDto>>.Ok(data));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.PickupLocations.Queries.Requests.GetPickupLocationByIdQuery(id), cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos.PickupLocationDto>.Ok(data));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] Medport.Application.Tracc.Features.PickupLocations.Commands.Requests.CreatePickupLocationCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos.PickupLocationDto>.Ok(data, "Pickup location created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] Medport.Application.Tracc.Features.PickupLocations.Commands.Requests.UpdatePickupLocationCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var data = await Mediator.Send(command, cancellationToken);
        if (data == null)
        {
            return Conflict(ApiResponse<object>.Fail("Duplicate pickup location name or not found"));
        }
        return Ok(ApiResponse<Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos.PickupLocationDto>.Ok(data, "Pickup location updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new Medport.Application.Tracc.Features.PickupLocations.Commands.Requests.DeletePickupLocationCommand(id), cancellationToken);
        return Ok(ApiResponse<object>.Ok(null, "Pickup location deactivated successfully"));
    }

    [HttpDelete("{id}/hard")]
    public async Task<ActionResult> HardDelete(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new Medport.Application.Tracc.Features.PickupLocations.Commands.Requests.HardDeletePickupLocationCommand(id), cancellationToken);
        return Ok(ApiResponse<object>.Ok(null, "Pickup location permanently deleted"));
    }
}
