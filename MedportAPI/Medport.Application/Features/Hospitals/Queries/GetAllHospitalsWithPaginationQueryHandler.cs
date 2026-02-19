using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Queries.Requests;
using Medport.Common.DTOs;
using Medport.Common.Mappings;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Hospitals.Queries;
public class GetAllHospitalsWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAllHospitalsWithPaginationQuery, PaginatedList<HospitalDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public static IQueryable<Hospital> ParameterLogic(IQueryable<Hospital> query, GetAllHospitalsWithPaginationQuery parameters)
    {
        if (!string.IsNullOrEmpty(parameters.Name))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.Name) && _.Name.Contains(parameters.Name, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(parameters.City))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.City) && _.City.Contains(parameters.City, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(parameters.State))
        {
            query = query.Where(_ => !string.IsNullOrWhiteSpace(_.State) && _.State.Contains(parameters.State, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(parameters.Type))
        {
            query = query.Where(_ => _.Type == parameters.Type);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Region))
        {
            query = query.Where(_ => _.Region == parameters.Region);
        }

        if (parameters.IsActive != null)
        {
            query = query.Where(_ => _.IsActive == parameters.IsActive);
        }


        return query;
    }

    public async Task<PaginatedList<HospitalDto>> Handle(
        GetAllHospitalsWithPaginationQuery request,
        CancellationToken cancellationToken
    )
    {
        // Setup Query
        IQueryable<Hospital> query = _context.Hospitals.AsNoTracking();

        // Filter
        query = ParameterLogic(query, request);

        // Execute 
        return await _mapper
            .ProjectTo<HospitalDto>(query)
            .PaginatedListAsync(request.Page, request.Limit, cancellationToken);
    }
}
