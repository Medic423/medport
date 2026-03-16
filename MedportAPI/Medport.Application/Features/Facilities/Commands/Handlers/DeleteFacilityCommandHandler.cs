using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Errors;
using Medport.Application.Tracc.Features.Hospitals.Errors;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class DeleteFacilityCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteFacilityCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteFacilityCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Facilities.FindAsync([request.Id], cancellationToken);

        if (entity == null)
        {
            throw new ErrorException(ErrorResult.Failure([FacilityErrors.NotFound(
                Constants.FacilityConstants.Error.DeleteFacilityCommandHandlerNotFound,
                request.Id)]));
        }

        _context.Facilities.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
