using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.DropdownCategories.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownCategories.Errors;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.DropdownCategories.Commands.Handlers;

public class UpdateDropdownCategoryCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<UpdateDropdownCategoryCommand, DropdownCategoryDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<DropdownCategoryDto> Handle(UpdateDropdownCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.DropdownCategories
            .Include(c => c.Options)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { DropdownCategoryErrors.NotFound("DropdownCategory.Update.NotFound", $"Dropdown category with id {request.Id} not found") }));
        }

        // Prevent slug changes
        if (!string.IsNullOrEmpty(request.Slug) && request.Slug != category.Slug)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { DropdownCategoryErrors.SlugChangeNotAllowed("DropdownCategory.Update.SlugChange", "Cannot change category slug. Categories are locked to fixed slugs.") }));
        }

        // Prevent deactivating category with active options
        if (request.IsActive.HasValue && request.IsActive.Value == false)
        {
            var activeOptions = category.Options.Count(o => o.IsActive);
            if (activeOptions > 0)
            {
                throw new ErrorException(ErrorResult.Failure(new[] { DropdownCategoryErrors.CannotDeactivateWithActiveOptions("DropdownCategory.Update.CannotDeactivateWithActiveOptions", $"Cannot deactivate category with {activeOptions} active option(s).") }));
            }
        }

        if (request.DisplayName != null)
        {
            category.DisplayName = request.DisplayName;
        }
        if (request.DisplayOrder.HasValue)
        {
            category.DisplayOrder = request.DisplayOrder.Value;
        }
        if (request.IsActive.HasValue)
        {
            category.IsActive = request.IsActive.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);

        DropdownCategoryDto dropdownCategoryDto = _mapper.Map<DropdownCategoryDto>(category);

        return dropdownCategoryDto;
    }
}
