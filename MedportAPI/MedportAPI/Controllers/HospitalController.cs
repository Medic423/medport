using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Constants;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Queries.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class HospitalController : ApiControllerBase
{
    // need error handling fix global exception to return api response of fail instead
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<HospitalDto>>>> GetAllPaginated(
            [FromQuery] GetAllHospitalsWithPaginationQuery query,
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

        var response = ApiResponse<List<HospitalDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpGet("{hospitalId}")]
    public async Task<ActionResult<HospitalDto>> GetByIdQuery(string hospitalId, CancellationToken cancellationToken)
    {
        return Ok(await Mediator.Send(new GetHospitalByIdQuery(hospitalId), cancellationToken));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<HospitalDto>>>> GetSearchQuery(
            [FromQuery] GetHospitalSearchQuery query,
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

        var response = ApiResponse<List<HospitalDto>>.Ok([.. data.Items], null, pagination);

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateHospitalCommand command)
    {
        var data = await Mediator.Send(command);

        var response = ApiResponse<HospitalDto>.Ok(data, HospitalConstants.GenericMessages.SavedSuccesfully);

        return Ok(response);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Update(string Id, [FromBody] UpdateHospitalCommand command)
    {
        var data = await Mediator.Send(command);

        var response = ApiResponse<HospitalDto>.Ok(data, HospitalConstants.GenericMessages.UpdatedSuccesfully);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> Delete(string Id)
    {
        await Mediator.Send(new DeleteHospitalCommand(Id));

        // Fix allow no data response
        var response = ApiResponse<HospitalDto>.Ok(null, HospitalConstants.GenericMessages.DeletedSuccesfully);

        return Ok(response);
    }

    [HttpPut("{id}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> ApproveHospital(string Id, [FromBody] ApproveHospitalCommand command)
    {
        var data = await Mediator.Send(command);

        var response = ApiResponse<HospitalDto>.Ok(data, HospitalConstants.GenericMessages.ApprovedSuccesfully);

        return Ok(response);
    }

    [HttpPut("{id}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesDefaultResponseType]
    public async Task<ActionResult> RejectHospital(string Id, [FromBody] RejectHospitalCommand command)
    {
        var data = await Mediator.Send(command);

        var response = ApiResponse<HospitalDto>.Ok(data, HospitalConstants.GenericMessages.RejectedSuccesfully);

        return Ok(response);
    }
}
