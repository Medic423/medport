using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Domain;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class DropdownOptionController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] GetAllDropdownOptionsQuery query, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(query, cancellationToken);

        var response = ApiResponse<List<DropdownOptionDto>>.Ok(data, Constants.DropdownOptionConstants.GenericMessages.OptionsRetrievedSuccesfully);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetDropdownOptionByIdQuery(id), cancellationToken);

        var response = ApiResponse<DropdownOptionDto>.Ok(data, Constants.DropdownOptionConstants.GenericMessages.OptionRetrievedSuccesfully);

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateDropdownOptionCommand command, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<DropdownOptionDto>.Ok(data, Constants.DropdownOptionConstants.GenericMessages.SavedSuccesfully);

        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateDropdownOptionCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;

        var data = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<DropdownOptionDto>.Ok(data, Constants.DropdownOptionConstants.GenericMessages.UpdatedSuccesfully);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteDropdownOptionCommand(id), cancellationToken);

        var response = ApiResponse<object>.Ok(null, Constants.DropdownOptionConstants.GenericMessages.DeletedSuccesfully);

        return Ok(response);
    }
}
