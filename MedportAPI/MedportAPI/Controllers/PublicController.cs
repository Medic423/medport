using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class PublicController : ApiControllerBase
{
    [HttpPost("geocode")]
    public async Task<ActionResult<ApiResponse<Medport.Application.Tracc.Features.Public.Queries.Dtos.GeocodeResultDto>>> Geocode([FromBody] Medport.Application.Tracc.Features.Public.Queries.Requests.GeocodeAddressCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<Medport.Application.Tracc.Features.Public.Queries.Dtos.GeocodeResultDto>.Ok(data));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<IEnumerable<string>>>> GetCategories(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.Public.Queries.Requests.GetCategoriesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<string>>.Ok(data));
    }

    [HttpGet("hospitals")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Medport.Application.Tracc.Features.Public.Queries.Dtos.HospitalPublicDto>>>> GetHospitals(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.Public.Queries.Requests.GetHospitalsQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<Medport.Application.Tracc.Features.Public.Queries.Dtos.HospitalPublicDto>>.Ok(data));
    }

    [HttpGet("subscription-plans")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Medport.Application.Tracc.Features.Public.Queries.Dtos.SubscriptionPlanDto>>>> GetSubscriptionPlans([FromQuery] string userType = "HEALTHCARE", CancellationToken cancellationToken = default)
    {
        var data = await Mediator.Send(new Medport.Application.Tracc.Features.Public.Queries.Requests.GetSubscriptionPlansQuery(userType), cancellationToken);
        return Ok(ApiResponse<IEnumerable<Medport.Application.Tracc.Features.Public.Queries.Dtos.SubscriptionPlanDto>>.Ok(data));
    }
}
