using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;

/// <summary>
/// See <see cref="DeleteAgencyResponseCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record DeleteAgencyResponseCommand(Guid Id) : IRequest;
