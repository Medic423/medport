using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using Medport.Application.Tracc.Features.Trips.Queries.Requests;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class TripController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransportRequestDto>>> Create([FromBody] Medport.Application.Tracc.Features.Trips.Commands.Requests.CreateTripCommand command, CancellationToken cancellationToken)
    {
        // If caller is a healthcare user, set HealthcareCreatedById from token
        var callerId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User?.FindFirst("id")?.Value;
        var callerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;
        if (!string.IsNullOrWhiteSpace(callerId) && string.Equals(callerUserType, "HEALTHCARE", StringComparison.OrdinalIgnoreCase))
        {
            if (Guid.TryParse(callerId, out var g)) command.HealthcareCreatedById = g;
        }

        var data = await Mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = data.Id }, ApiResponse<TransportRequestDto>.Ok(data, "Transport request created"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<TransportRequestDto>>>> GetAll([FromQuery] string status = null, [FromQuery] string transportLevel = null, [FromQuery] string priority = null, [FromQuery] string agencyId = null, CancellationToken cancellationToken = default)
    {
        // Resolve healthcare user id from token for healthcare users
        var callerId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User?.FindFirst("id")?.Value;
        var callerUserType = User?.FindFirst("userType")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;
        string healthcareUserId = null;
        if (!string.IsNullOrWhiteSpace(callerId) && string.Equals(callerUserType, "HEALTHCARE", StringComparison.OrdinalIgnoreCase))
        {
            healthcareUserId = callerId;
        }

        var query = new GetTripsQuery
        {
            Status = status,
            TransportLevel = transportLevel,
            Priority = priority,
            AgencyId = agencyId,
            HealthcareUserId = healthcareUserId
        };

        var data = await Mediator.Send(query, cancellationToken);
        return Ok(ApiResponse<IEnumerable<TransportRequestDto>>.Ok(data));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TransportRequestDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.Trips.Queries.Requests.GetTripByIdQuery(id), cancellationToken);
        if (data == null) return NotFound(ApiResponse<object>.Fail("Trip not found"));
        return Ok(ApiResponse<TransportRequestDto>.Ok(data));
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<TransportRequestDto>>> UpdateStatus(Guid id, [FromBody] Medport.Application.Tracc.Features.Trips.Commands.Requests.UpdateTripStatusCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var data = await Mediator.Send(command, cancellationToken);
        if (data == null) return NotFound(ApiResponse<object>.Fail("Trip not found"));
        return Ok(ApiResponse<TransportRequestDto>.Ok(data, "Transport request status updated"));
    }

    [HttpPost("{id}/authorize")]
    public async Task<ActionResult<ApiResponse<TransportRequestDto>>> Authorize(Guid id, CancellationToken cancellationToken)
    {
        var cmd = new Medport.Application.Tracc.Features.Trips.Commands.Requests.AuthorizeTripCommand { Id = id, AuthorizedTime = DateTime.UtcNow };
        var data = await Mediator.Send(cmd, cancellationToken);
        if (data == null) return NotFound(ApiResponse<object>.Fail("Trip not found"));
        return Ok(ApiResponse<TransportRequestDto>.Ok(data, "Trip authorized"));
    }

    [HttpPut("{id}/assign-unit")]
    public ActionResult AssignUnitDisabled(Guid id)
    {
        return StatusCode(410, ApiResponse<object>.Fail("Unit assignment is no longer supported. Use agency-level acceptance only."));
    }

    [HttpGet("options/diagnosis")]
    public ActionResult<ApiResponse<IEnumerable<string>>> GetDiagnosisOptions()
    {
        var options = new[] { "General", "Cardiac", "Orthopedic", "Neurology", "Other" };
        return Ok(ApiResponse<IEnumerable<string>>.Ok(options));
    }

    [HttpGet("options/mobility")]
    public ActionResult<ApiResponse<IEnumerable<string>>> GetMobilityOptions()
    {
        var options = new[] { "Ambulatory", "Wheelchair", "Stretcher" };
        return Ok(ApiResponse<IEnumerable<string>>.Ok(options));
    }

    [HttpGet("options/transport-level")]
    public ActionResult<ApiResponse<IEnumerable<string>>> GetTransportLevelOptions()
    {
        var options = new[] { "BLS", "ALS", "CCT", "Other" };
        return Ok(ApiResponse<IEnumerable<string>>.Ok(options));
    }

    [HttpGet("options/urgency")]
    public ActionResult<ApiResponse<IEnumerable<string>>> GetUrgencyOptions()
    {
        var options = new[] { "Routine", "Urgent", "Emergent" };
        return Ok(ApiResponse<IEnumerable<string>>.Ok(options));
    }

    [HttpGet("options/insurance")]
    public ActionResult<ApiResponse<IEnumerable<string>>> GetInsuranceOptions()
    {
        // Placeholder - integrate with insurance table if available
        var options = new string[0];
        return Ok(ApiResponse<IEnumerable<string>>.Ok(options));
    }
}
