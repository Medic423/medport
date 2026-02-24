using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;

/// <summary>
/// See <see cref="DeleteDropdownOptionCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record DeleteDropdownOptionCommand(Guid Id) : IRequest;
