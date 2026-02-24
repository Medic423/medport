using MediatR;
using Medport.Application.Tracc.Features.DropdownCategories.Commands.Handlers;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;

namespace Medport.Application.Tracc.Features.DropdownCategories.Commands.Requests;

/// <summary>
/// See <see cref="UpdateDropdownCategoryCommandHandler"/>
/// </summary>
public class UpdateDropdownCategoryCommand : IRequest<DropdownCategoryDto>
{
    public Guid Id { get; set; }
    public string? Slug { get; set; }
    public string? DisplayName { get; set; }
    public int? DisplayOrder { get; set; }
    public bool? IsActive { get; set; }
}
