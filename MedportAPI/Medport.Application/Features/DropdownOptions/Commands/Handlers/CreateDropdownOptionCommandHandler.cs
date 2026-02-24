using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.DropdownOptions.Commands.Handlers;

public class CreateDropdownOptionCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<CreateDropdownOptionCommand, DropdownOptionDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<DropdownOptionDto> Handle(CreateDropdownOptionCommand request, CancellationToken cancellationToken)
    {
        DropdownOption entity = _mapper.Map<DropdownOption>(request);

        await _context.DropdownOptions.AddAsync(entity, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<DropdownOptionDto>(entity);

        return dto;
    }
}
