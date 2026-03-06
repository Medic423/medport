using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareLocations.Errors;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Errors;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;

public class DeleteHealthcareLocationCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteHealthcareLocationCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteHealthcareLocationCommand request, CancellationToken cancellationToken)
    {
        HealthcareLocation? entity = await _context.HealthcareLocations
           .FindAsync([request.Id], cancellationToken);

        if (entity == null)
        {
            // TODO FIx
            //throw new ErrorException(ErrorResult.Failure([HealthcareLocationErrors.NotFound(
            //    Constants.HospitalConstants.Error.DeleteHospitalCommandHandlerNotFound,
            //    request.Id)]));
        }

        _context.HealthcareLocations.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }
}