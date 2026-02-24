using Medport.API.Tracc.Controllers.BaseController;
using Medport.API.Tracc.CustomAttributes;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Backups.Commands.Requests;
using Medport.Application.Tracc.Features.Backups.Queries.Dtos;
using Medport.Application.Tracc.Features.Backups.Queries.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace Medport.API.Tracc.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ServiceFilter(typeof(ModelValidationAttribute))]
[ExcludeFromCodeCoverage]
public class BackupController : ApiControllerBase
{
    [HttpGet("history")]
    public async Task<ActionResult> GetHistory(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new GetBackupHistoryQuery(), cancellationToken);

        var response = ApiResponse<List<BackupFileDto>>.Ok(data);

        return Ok(response);
    }

    [HttpPost("create")]
    public async Task<ActionResult> Create(CancellationToken cancellationToken)
    {
        var data = await Mediator.Send(new CreateBackupCommand(), cancellationToken);

        var response = ApiResponse<CreateBackupResultDto>.Ok(data, data.Message);

        return Ok(response);
    }

    [HttpGet("download/{filename}")]
    public async Task<ActionResult> Download(string filename, CancellationToken cancellationToken)
    {
        var filePath = await Mediator.Send(new GetBackupFileQuery(filename), cancellationToken);

        if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
        {
            return NotFound(ApiResponse<string>.Fail("Backup file not found"));
        }

        return PhysicalFile(filePath, "application/json", filename);
    }

    [HttpDelete("{filename}")]
    public async Task<ActionResult> Delete(string filename, CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteBackupCommand(filename), cancellationToken);

        var response = ApiResponse<string>.Ok(null, "Backup file deleted successfully");

        return Ok(response);
    }
}
