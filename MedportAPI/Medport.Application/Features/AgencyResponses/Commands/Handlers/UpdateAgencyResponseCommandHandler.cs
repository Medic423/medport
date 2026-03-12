using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Application.Tracc.Features.AgencyResponses.Errors;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AgencyResponses.Commands.Handlers;

public class UpdateAgencyResponseCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<UpdateAgencyResponseCommand, AgencyResponseDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<AgencyResponseDto> Handle(UpdateAgencyResponseCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.AgencyResponses.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { AgencyResponseErrors.NotFound("AgencyResponse.Update.NotFound", $"Agency response with id {request.Id} not found") }));
        }

        //if (request.TransportRequestId.HasValue)
        //    entity.TransportRequestId = request.TransportRequestId.Value;
        //if (request.AgencyId.HasValue)
        //    entity.AgencyId = request.AgencyId.Value;
        //if (request.EmsUserId.HasValue)
        //    entity.EmsUserId = request.EmsUserId.Value;
        //if (request.Response != null)
        //    entity.Response = request.Response;
        //if (request.ResponseNotes != null)
        //    entity.ResponseNotes = request.ResponseNotes;
        //if (request.EstimatedEta.HasValue)
        //    entity.EstimatedEta = request.EstimatedEta.Value;
        //if (request.Status != null)
        //    entity.Status = request.Status;

        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AgencyResponseDto>(entity);
    }
}
