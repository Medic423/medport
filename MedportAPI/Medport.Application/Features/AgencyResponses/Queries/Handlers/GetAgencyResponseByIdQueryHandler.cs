using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Application.Tracc.Features.AgencyResponses.Errors;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AgencyResponses.Queries.Handlers;

public class GetAgencyResponseByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAgencyResponseByIdQuery, AgencyResponseDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<AgencyResponseDto> Handle(GetAgencyResponseByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.AgencyResponses.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new ErrorException(ErrorResult.Failure(new[] { AgencyResponseErrors.NotFound("AgencyResponse.Get.NotFound", $"Agency response with id {request.Id} not found") }));
        }

        return _mapper.Map<AgencyResponseDto>(entity);
    }
}
