using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Hospitals.Constants;
using Medport.Application.Tracc.Features.Hospitals.Errors;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Queries.Requests;
using Medport.Common.Constants;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace Medport.Application.Tracc.Features.Hospitals.Queries;
public class GetHospitalByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetHospitalByIdQuery, HospitalDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HospitalDto> Handle(GetHospitalByIdQuery request, CancellationToken cancellationToken)
    {
        // Setup Query
        IQueryable<Hospital> query = _context.Hospitals;

        // Build ID Where
        query = query.Where(x => x.Id == request.HospitalId);

        // Execute 
        HospitalDto? hospital = await _mapper.ProjectTo<HospitalDto>(query)
            .FirstOrDefaultAsync(cancellationToken);

        if (hospital is null)
        {
            throw new ErrorException(ErrorResult.Failure([HospitalErrors.NotFound(
                HospitalConstants.Error.GetHospitalByIdQueryHandlerNotFound,
                request.HospitalId)]));
        }

        return hospital;
    }
}