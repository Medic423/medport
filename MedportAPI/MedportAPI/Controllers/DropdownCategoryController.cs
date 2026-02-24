using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Requests;
using Medport.Application.Tracc.Features.DropdownCategories.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.DropdownCategories.Constants;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class DropdownCategoryController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetAllDropdownCategoriesQuery(), cancellationToken);

        var response = ApiResponse<List<DropdownCategoryDto>>.Ok(data, DropdownCategoryConstants.GenericMessages.CategoriesRetrievedSuccesfully);

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetDropdownCategoryByIdQuery(id), cancellationToken);

        var response = ApiResponse<DropdownCategoryDto>.Ok(data, DropdownCategoryConstants.GenericMessages.CategoriesRetrievedSuccesfully);

        return Ok(response);
    }

    [HttpPost]
    public ActionResult Create()
    {
        // Creation of categories is disabled in the original service
        return Forbid();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(
        Guid id, 
        [FromBody] UpdateDropdownCategoryCommand command, 
        CancellationToken cancellationToken
    )
    {
        command.Id = id;

        var updatedDropdown = await Mediator.Send(command, cancellationToken);

        var response = ApiResponse<DropdownCategoryDto>.Ok(updatedDropdown, DropdownCategoryConstants.GenericMessages.UpdatedSuccesfully);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteDropdownCategoryCommand(id), cancellationToken);

        var response = ApiResponse<object>.Ok(null, DropdownCategoryConstants.GenericMessages.DeletedSuccesfully);

        return Ok(response);
    }
}
