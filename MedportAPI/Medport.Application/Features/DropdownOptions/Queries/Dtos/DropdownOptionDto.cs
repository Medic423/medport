using System;

namespace Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;

public class DropdownOptionDto
{
    public Guid Id { get; set; }
    public Guid? CategoryId { get; set; }
    public string Value { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
