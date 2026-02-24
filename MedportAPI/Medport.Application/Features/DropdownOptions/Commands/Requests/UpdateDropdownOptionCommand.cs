using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Handlers;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;

/// <summary>
/// See <see cref="UpdateDropdownOptionCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record UpdateDropdownOptionCommand : IRequest<DropdownOptionDto>
{
    public required Guid Id { get; set; }

    public Guid? CategoryId { get; set; }

    public string? Value { get; set; }

    public bool? IsActive { get; set; }

    public int? DisplayOrder { get; set; }
}
