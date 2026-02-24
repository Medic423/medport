using System;

namespace Medport.Application.Tracc.Features.Backups.Queries.Dtos;

public record CreateBackupResultDto
{
    public required string Filename { get; init; }

    public required long Size { get; init; }

    public required DateTime Created { get; init; }

    public string? Message { get; init; }
}
