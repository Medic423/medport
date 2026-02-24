using MediatR;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Backups.Commands.Requests;

[ExcludeFromCodeCoverage]
public record CreateBackupCommand : IRequest<Medport.Application.Tracc.Features.Backups.Queries.Dtos.CreateBackupResultDto>;
