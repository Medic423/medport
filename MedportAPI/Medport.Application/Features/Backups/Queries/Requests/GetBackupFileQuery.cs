using MediatR;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Backups.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetBackupFileQuery(string Filename) : IRequest<string?>;
