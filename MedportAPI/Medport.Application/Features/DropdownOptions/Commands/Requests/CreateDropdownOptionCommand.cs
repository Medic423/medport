using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Handlers;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;

/// <summary>
/// See <see cref="CreateDropdownOptionCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record CreateDropdownOptionCommand : IRequest<DropdownOptionDto>
{
    public Guid? CategoryId { get; set; }

    public required string Value { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; } = 0;
}
