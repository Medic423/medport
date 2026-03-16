using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Facilities.Errors;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

public class UpdateFacilityCommandHandler(
    IApplicationDbContext context,
    IMediator mediator,
    IMapper mapper
) :
    IRequestHandler<UpdateFacilityCommand, FacilityDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMediator _mediator = mediator;
    private readonly IMapper _mapper = mapper;

    public async Task<FacilityDto> Handle(UpdateFacilityCommand request, CancellationToken cancellationToken)
    {
        var facility = await _context.Facilities.FindAsync([request.Id], cancellationToken);
        
        if (facility == null)
        {
            throw new ErrorException(ErrorResult.Failure([FacilityErrors.NotFound(
                Constants.FacilityConstants.Error.UpdateFacilityCommandHandlerNotFound,
                request.Id)]));
        }

        _mapper.Map(request, facility);

        await _context.SaveChangesAsync(cancellationToken);

        var mappedDto = await _mediator.Send(new MapEntityToFacilityDtoQuery(facility), cancellationToken);

        return mappedDto;
    }
}
