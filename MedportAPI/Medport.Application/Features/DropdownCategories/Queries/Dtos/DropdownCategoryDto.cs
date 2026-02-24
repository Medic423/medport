using System;

namespace Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;

public class DropdownCategoryDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int OptionCount { get; set; }
}
