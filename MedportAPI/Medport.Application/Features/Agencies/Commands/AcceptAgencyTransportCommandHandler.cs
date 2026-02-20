using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Agencies.Commands;
public class AcceptAgencyTransportCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<CreateHospitalCommand, HospitalDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HospitalDto> Handle(CreateHospitalCommand request, CancellationToken cancellationToken)
    {
        AgencyResponse newAgencyResponse = _mapper.Map<AgencyResponse>(request);

        await _context.Hospitals.AddAsync(newAgencyResponse, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        HospitalDto hospital = _mapper.Map<HospitalDto>(newAgencyResponse);

        return hospital;
    }
}
