using MediatR;
using Medport.Application.Tracc.Features.Backups.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Backups.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetBackupHistoryQuery : IRequest<List<BackupFileDto>>;
