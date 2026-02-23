using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Constants;
using Medport.Application.Tracc.Features.Hospitals.Errors;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.Hospitals.Commands;
public class RejectHospitalCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<RejectHospitalCommand, HospitalDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HospitalDto> Handle(RejectHospitalCommand request, CancellationToken cancellationToken)
    {
        Hospital? updatedHospital = await _context.Hospitals
            .FindAsync([request.Id], cancellationToken);

        if (updatedHospital == null)
        {
            throw new ErrorException(ErrorResult.Failure([HospitalErrors.NotFound(
                HospitalConstants.Error.UpdateHospitalCommandHandlerNotFound,
                request.Id)]));
        }

        // can move this to applicationdbcontext
        //updatedHospital.ApprovedBy = request.ApprovedBy;
        updatedHospital.UpdatedAt = DateTime.UtcNow;

        _mapper.Map(request, updatedHospital);

        await _context.SaveChangesAsync(cancellationToken);

        HospitalDto hospital = _mapper.Map<HospitalDto>(updatedHospital);

        return hospital;
    }
}
