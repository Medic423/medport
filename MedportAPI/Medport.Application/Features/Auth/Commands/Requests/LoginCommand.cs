using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Handlers;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

/// <summary>
/// See <see cref="LoginCommandHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public class LoginCommand : IRequest<AuthResultDto>
{
    public required string EncodedAuth { get; set; }
}
