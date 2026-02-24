using MediatR;
using Medport.Application.Tracc.Features.Backups.Queries.Requests;
using System.Diagnostics.CodeAnalysis;
using System.IO;

namespace Medport.Application.Tracc.Features.Backups.Queries.Handlers;

[ExcludeFromCodeCoverage]
public class GetBackupFileQueryHandler : IRequestHandler<GetBackupFileQuery, string?>
{
    public GetBackupFileQueryHandler()
    {
    }

    public Task<string?> Handle(GetBackupFileQuery request, CancellationToken cancellationToken)
    {
        var backupDir = Path.Combine(Directory.GetCurrentDirectory(), "database-backups");
        var filePath = Path.Combine(backupDir, request.Filename);

        if (File.Exists(filePath))
        {
            return Task.FromResult<string?>(filePath);
        }

        // try external drive
        var externalFilePath = Path.Combine("/Volumes/Acasis/tcc-database-backups", request.Filename);
        if (File.Exists(externalFilePath))
        {
            return Task.FromResult<string?>(externalFilePath);
        }

        return Task.FromResult<string?>(null);
    }
}
