using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Errors;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Constants;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;

public class UpdateHealthcareLocationCommandHandler(IApplicationDbContext context, IMapper mapper) : 
    IRequestHandler<UpdateHealthcareLocationCommand, HealthcareLocationDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HealthcareLocationDto> Handle(UpdateHealthcareLocationCommand request, CancellationToken cancellationToken)
    {
        HealthcareLocation? updatedHealthcareLocation = await _context.HealthcareLocations
            .FindAsync([request.Id], cancellationToken);

        if (updatedHealthcareLocation == null)
        {
            throw new ErrorException(ErrorResult.Failure([HealthcareLocationErrors.NotFound(
                HospitalConstants.Error.UpdateHospitalCommandHandlerNotFound,
                request.Id)]));
        }

        _mapper.Map(request, updatedHealthcareLocation);

        await _context.SaveChangesAsync(cancellationToken);

        HealthcareLocationDto healthcareLocation = _mapper.Map<HealthcareLocationDto>(updatedHealthcareLocation);

        return healthcareLocation;
    }
}
