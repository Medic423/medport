using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Common.DTOs;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class AnalyticsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Get(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetAnalyticsQuery(), cancellationToken);

        var response = ApiResponse<AnalyticsDto>.Ok(data, Medport.Domain.Constants.AnalyticsConstants.GenericMessages.AnalyticsRetrievedSuccesfully);

        return Ok(response);
    }
}
