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
public class TCCUnitController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<ShedDto>>> GetAllPaginated(
            [FromQuery] GetAllShedWithPaginationQuery query,
            CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(query, cancellationToken));
    }

    [HttpGet("AutoComplete/InternationalCustomerLoadStop")]
    public async Task<ActionResult<List<ShedWithAddressAutocompleteDto>>> GetInternationalCustomerLoadStopShedAutocomplete(
       [FromQuery] GetLoadStopShedAutocompleteQuery query,
       CancellationToken cancellationToken
)
    {
        query.IsInternationalCustomer = true;
        return await Mediator.Send(query, cancellationToken);
    }

    [HttpGet("{shedGuid}")]
    public async Task<ActionResult<ShedDto>> GetByIdQuery(Guid shedGuid, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetShedByIdQuery(shedGuid), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateShedCommand command)
    {
        return Ok(await Mediator.Send(command));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateShedCommand command)
    {
        await Mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteShedCommand(id));
        return NoContent();
    }
}
