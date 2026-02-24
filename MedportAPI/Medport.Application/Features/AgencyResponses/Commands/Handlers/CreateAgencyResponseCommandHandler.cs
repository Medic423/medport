using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.AgencyResponses.Commands.Handlers;

public class CreateAgencyResponseCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<CreateAgencyResponseCommand, AgencyResponseDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<AgencyResponseDto> Handle(CreateAgencyResponseCommand request, CancellationToken cancellationToken)
    {
        var entity = _mapper.Map<AgencyResponse>(request);

        await _context.AgencyResponses.AddAsync(entity, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<AgencyResponseDto>(entity);

        return dto;
    }
}
