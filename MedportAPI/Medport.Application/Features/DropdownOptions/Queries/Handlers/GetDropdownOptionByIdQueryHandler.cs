using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Application.Tracc.Features.DropdownOptions.Errors;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.DropdownOptions.Queries.Handlers;

public class GetDropdownOptionByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetDropdownOptionByIdQuery, DropdownOptionDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<DropdownOptionDto> Handle(GetDropdownOptionByIdQuery request, CancellationToken cancellationToken)
    {
        var option = await _context.DropdownOptions.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (option == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { DropdownOptionErrors.NotFound("DropdownOption.Get.NotFound", $"Dropdown option with id {request.Id} not found") }));
        }

        return _mapper.Map<DropdownOptionDto>(option);
    }
}
