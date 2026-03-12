using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Errors;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Hospitals.Commands;

public class DeleteHospitalCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteHospitalCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteHospitalCommand request, CancellationToken cancellationToken)
    {
        //Hospital? entity = await _context.Hospitals
        //   .FindAsync([request.Id], cancellationToken);

        //if (entity == null)
        //{
        //    throw new ErrorException(ErrorResult.Failure([HospitalErrors.NotFound(
        //        Constants.HospitalConstants.Error.DeleteHospitalCommandHandlerNotFound,
        //        request.Id)]));
        //}

        //_context.Hospitals.Remove(entity);

        //await _context.SaveChangesAsync(cancellationToken);

        return;
    }
}