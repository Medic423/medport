using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;

public class CreateHealthcareLocationCommandHandler(IApplicationDbContext context, IMapper mapper) : 
    IRequestHandler<UpdateHealthcareLocationCommand, HealthcareLocationDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HealthcareLocationDto> Handle(UpdateHealthcareLocationCommand request, CancellationToken cancellationToken)
    {
        HealthcareLocation newHealthcareLocation = _mapper.Map<HealthcareLocation>(request);

        await _context.HealthcareLocations.AddAsync(newHealthcareLocation, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        HealthcareLocationDto healthcareLocation = _mapper.Map<HealthcareLocationDto>(newHealthcareLocation);

        return healthcareLocation;
    }
}
