using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Agencies.Commands.Requests;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Agencies.Commands;
public class RejectAgencyTransportCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<RejectAgencyTransportCommand, AgencyDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<AgencyDto> Handle(RejectAgencyTransportCommand request, CancellationToken cancellationToken)
    {
        AgencyResponse newAgencyResponse = _mapper.Map<AgencyResponse>(request);

        await _context.AgencyResponses.AddAsync(newAgencyResponse, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        AgencyDto agency = _mapper.Map<AgencyDto>(newAgencyResponse);

        return agency;
    }
}
