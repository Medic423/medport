using MediatR;
using Medport.Application.Tracc.Features.Backups.Commands.Requests;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Backups.Commands.Handlers;

[ExcludeFromCodeCoverage]
public class DeleteBackupCommandHandler() : IRequestHandler<DeleteBackupCommand>
{
    public Task Handle(DeleteBackupCommand request, CancellationToken cancellationToken)
    {
        var backupDir = Path.Combine(Directory.GetCurrentDirectory(), "database-backups");
        var filePath = Path.Combine(backupDir, request.Filename);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        // also try external drive path used in node script
        var externalDrivePath = Path.Combine("/Volumes/Acasis/tcc-database-backups");
        var externalFilePath = Path.Combine(externalDrivePath, request.Filename);
        try
        {
            if (File.Exists(externalFilePath))
            {
                File.Delete(externalFilePath);
            }
        }
        catch { }

        return Task.CompletedTask;
    }
}
