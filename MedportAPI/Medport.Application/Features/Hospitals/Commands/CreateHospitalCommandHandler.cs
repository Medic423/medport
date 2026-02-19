using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Hospitals.Commands;
public class CreateHospitalCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<CreateHospitalCommand, HospitalDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HospitalDto> Handle(CreateHospitalCommand request, CancellationToken cancellationToken)
    {
        Hospital newHospital = _mapper.Map<Hospital>(request);

        await _context.Hospitals.AddAsync(newHospital, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        HospitalDto hospital = _mapper.Map<HospitalDto>(newHospital);

        return hospital;
    }
}
