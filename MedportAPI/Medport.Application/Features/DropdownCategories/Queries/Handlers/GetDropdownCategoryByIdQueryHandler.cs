using MediatR;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Requests;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.DropdownCategories.Errors;

namespace Medport.Application.Tracc.Features.DropdownCategories.Queries.Handlers;

public class GetDropdownCategoryByIdQueryHandler(IApplicationDbContext context) : IRequestHandler<GetDropdownCategoryByIdQuery, DropdownCategoryDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<DropdownCategoryDto> Handle(GetDropdownCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _context.DropdownCategories
            .Where(c => c.Id == request.Id)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (category == null)
        {
            throw new ErrorException(ErrorResult.Failure([DropdownCategoryErrors.NotFound("DropdownCategory.GetById.NotFound", $"Dropdown category with id {request.Id} was not found")]));
        }

        return category;
    }
}
