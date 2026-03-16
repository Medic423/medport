using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Facilities.Errors;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class GetFacilityByIdQueryHandler(
    IApplicationDbContext context,
    IMediator mediator
) : 
    IRequestHandler<GetFacilityByIdQuery, FacilityDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMediator _mediator = mediator;

    public async Task<FacilityDto> Handle(GetFacilityByIdQuery request, CancellationToken cancellationToken)
    {
        var facility = await _context.Facilities
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == request.Id);

        if (facility == null)
        {
            throw new ErrorException(ErrorResult.Failure([FacilityErrors.NotFound(
                Constants.FacilityConstants.Error.GetFacilityByIdQueryHandlerNotFound,
                request.Id)]));
        }

        var mappedDto = await _mediator.Send(new MapEntityToFacilityDtoQuery(facility), cancellationToken);

        return mappedDto;
    }
}
