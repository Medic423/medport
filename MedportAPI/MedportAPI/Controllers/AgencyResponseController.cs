using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
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
public class AgencyResponseController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] GetAllAgencyResponsesQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);

        var response = ApiResponse<List<AgencyResponseDto>>.Ok(data, Medport.Domain.Constants.AgencyResponseConstants.GenericMessages.RetrievedSuccesfully);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetAgencyResponseByIdQuery(id), cancellationToken);

        var response = ApiResponse<AgencyResponseDto>.Ok(data, Medport.Domain.Constants.AgencyResponseConstants.GenericMessages.RetrievedSuccesfully);

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateAgencyResponseCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<AgencyResponseDto>.Ok(data, Medport.Domain.Constants.AgencyResponseConstants.GenericMessages.CreatedSuccesfully);

        return Ok(response);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateAgencyResponseCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;

        var data = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<AgencyResponseDto>.Ok(data, Medport.Domain.Constants.AgencyResponseConstants.GenericMessages.UpdatedSuccesfully);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteAgencyResponseCommand(id), cancellationToken);

        var response = ApiResponse<object>.Ok(null, Medport.Domain.Constants.AgencyResponseConstants.GenericMessages.DeletedSuccesfully);

        return Ok(response);
    }
}
