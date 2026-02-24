using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Errors;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.DropdownOptions.Commands.Handlers;

public class DeleteDropdownOptionCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteDropdownOptionCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteDropdownOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _context.DropdownOptions.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (option == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { DropdownOptionErrors.NotFound("DropdownOption.Delete.NotFound", $"Dropdown option with id {request.Id} not found") }));
        }

        option.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
