using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.DropdownCategories.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownCategories.Constants;
using Medport.Application.Tracc.Features.DropdownCategories.Errors;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.DropdownCategories.Commands.Handlers;

public class DeleteDropdownCategoryCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteDropdownCategoryCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteDropdownCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.DropdownCategories
            .Include(c => c.Options)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null)
        {
            throw new ErrorException(ErrorResult.Failure([DropdownCategoryErrors.NotFound(
                DropdownCategoryConstants.Error.DeleteDropdownCategoryCommandHandlerNotFound,
                request.Id.ToString())]));
        }

        var activeOptions = category.Options.Count(o => o.IsActive);
        if (activeOptions > 0)
        {
            throw new ErrorException(ErrorResult.Failure([DropdownCategoryErrors.CannotDeleteWithActiveOptions("DropdownCategory.Delete.CannotDeleteWithActiveOptions", $"Cannot delete category with {activeOptions} active option(s).")]));
        }

        category.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
