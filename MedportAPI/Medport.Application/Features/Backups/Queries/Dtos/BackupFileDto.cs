using System;

namespace Medport.Application.Tracc.Features.Backups.Queries.Dtos;

public record BackupFileDto
{
    public required string Filename { get; init; }

    public required long Size { get; init; }

    public required DateTime Created { get; init; }

    public required DateTime Modified { get; init; }
}
