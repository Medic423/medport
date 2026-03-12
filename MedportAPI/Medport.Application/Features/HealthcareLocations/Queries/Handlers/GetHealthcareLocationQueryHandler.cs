using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Handlers;

public class GetHealthcareLocationQueryHandler(
    IApplicationDbContext context,
    IMapper mapper
) : IRequestHandler<GetHealthcareLocationsQuery, List<HealthcareLocationDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<List<HealthcareLocationDto>> Handle(
        GetHealthcareLocationsQuery request,
        CancellationToken cancellationToken
    )
    {
        //IQueryable<HealthcareLocation> query = _context.HealthcareLocations.AsNoTracking();

        //query = query.Where(x => x.HealthcareUserId == request.HealthcareUserId && x.IsActive == request.IsActive);

        //List<HealthcareLocationDto> healthcareLocations = await _mapper
        //    .ProjectTo<HealthcareLocationDto>(query)
        //    .ToListAsync(cancellationToken);

        //return healthcareLocations;

        return null;
    }
}