using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Errors;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AgencyResponses.Commands.Handlers;

public class DeleteAgencyResponseCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteAgencyResponseCommand>
{
    private readonly IApplicationDbContext _context = context;

    public async Task Handle(DeleteAgencyResponseCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.AgencyResponses.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { AgencyResponseErrors.NotFound("AgencyResponse.Delete.NotFound", $"Agency response with id {request.Id} not found") }));
        }

        // Soft-delete by setting status
        entity.Status = "DELETED";
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
