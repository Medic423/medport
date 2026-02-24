using MediatR;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Backups.Commands.Requests;

[ExcludeFromCodeCoverage]
public record DeleteBackupCommand(string Filename) : IRequest;
