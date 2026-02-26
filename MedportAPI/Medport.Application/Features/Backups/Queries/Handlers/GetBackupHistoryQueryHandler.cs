using MediatR;
using Medport.Application.Tracc.Features.Backups.Queries.Dtos;
using Medport.Application.Tracc.Features.Backups.Queries.Requests;
using Medport.Domain.Interfaces;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Backups.Queries.Handlers;

[ExcludeFromCodeCoverage]
public class GetBackupHistoryQueryHandler() : IRequestHandler<GetBackupHistoryQuery, List<BackupFileDto>>
{
    public Task<List<BackupFileDto>> Handle(GetBackupHistoryQuery request, CancellationToken cancellationToken)
    {
        var backupDir = Path.Combine(Directory.GetCurrentDirectory(), "database-backups");

        if (!Directory.Exists(backupDir))
        {
            Directory.CreateDirectory(backupDir);
        }

        var files = Directory.GetFiles(backupDir, "*.json")
            .Select(f => new FileInfo(f))
            .Select(fi => new BackupFileDto
            {
                Filename = fi.Name,
                Size = fi.Length,
                Created = fi.CreationTimeUtc,
                Modified = fi.LastWriteTimeUtc
            })
            .OrderByDescending(x => x.Created)
            .ToList();

        return Task.FromResult(files);
    }
}
