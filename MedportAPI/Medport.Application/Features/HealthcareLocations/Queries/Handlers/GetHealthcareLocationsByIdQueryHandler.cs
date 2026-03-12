using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.HealthcareLocations.Errors;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;
using Medport.Application.Tracc.Features.Hospitals.Constants;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;

public class GetHealthcareLocationsByIdQueryHandler(
    IApplicationDbContext context, 
    IMapper mapper
) : IRequestHandler<GetHealthcareLocationsByIdQuery, HealthcareLocationDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<HealthcareLocationDto> Handle(
        GetHealthcareLocationsByIdQuery request, 
        CancellationToken cancellationToken
    )
    {
        //// Setup Query
        //IQueryable<HealthcareLocation> query = _context.HealthcareLocations;

        //// Build ID Where
        //query = query.Where(x => x.Id == request.HealthcareLocationId);

        //// Execute 
        //HealthcareLocationDto? healthcareLocation = await _mapper.ProjectTo<HealthcareLocationDto>(query)
        //    .FirstOrDefaultAsync(cancellationToken);

        //if (healthcareLocation is null)
        //{
        //    throw new ErrorException(ErrorResult.Failure([HealthcareLocationErrors.NotFound(
        //        HospitalConstants.Error.GetHospitalByIdQueryHandlerNotFound,
        //        request.HealthcareLocationId)]));
        //}

        //return healthcareLocation;

        return null;
    }
}