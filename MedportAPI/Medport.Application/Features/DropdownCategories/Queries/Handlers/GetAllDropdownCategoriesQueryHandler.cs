using MediatR;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Requests;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.DropdownCategories.Queries.Handlers;

public class GetAllDropdownCategoriesQueryHandler(IApplicationDbContext context) : IRequestHandler<GetAllDropdownCategoriesQuery, List<DropdownCategoryDto>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<List<DropdownCategoryDto>> Handle(GetAllDropdownCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.DropdownCategories
            .OrderBy(c => c.DisplayOrder)
            .Where(x => x.IsActive)
            .Select(c => new DropdownCategoryDto
            {
                Id = c.Id,
                Slug = c.Slug,
                DisplayName = c.DisplayName,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                OptionCount = c.Options.Count(o => o.IsActive)
            })
            .ToListAsync(cancellationToken);

        return categories;
    }
}
