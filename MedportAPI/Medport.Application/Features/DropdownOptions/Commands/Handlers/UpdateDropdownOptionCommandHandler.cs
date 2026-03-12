using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Errors;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.DropdownOptions.Commands.Handlers;

public class UpdateDropdownOptionCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<UpdateDropdownOptionCommand, DropdownOptionDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<DropdownOptionDto> Handle(UpdateDropdownOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _context.DropdownOptions.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (option == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { DropdownOptionErrors.NotFound("DropdownOption.Update.NotFound", $"Dropdown option with id {request.Id} not found") }));
        }

        if (request.Value != null)
        {
            option.Value = request.Value;
        }
        if (request.DisplayOrder.HasValue)
        {
            option.DropdownCategory.DisplayOrder = request.DisplayOrder.Value;
        }
        if (request.IsActive.HasValue)
        {
            option.IsActive = request.IsActive.Value;
        }
        if (request.CategoryId.HasValue)
        {
            option.CategoryId = request.CategoryId;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<DropdownOptionDto>(option);

        return dto;
    }
}
