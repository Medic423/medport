using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Queries.Requests;
using Medport.Common.DTOs;
using Medport.Common.Helpers;
using Medport.Common.Mappings;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

public class SearchFacilityQueryHandler(IApplicationDbContext context, IMapper mapper) : 
    IRequestHandler<SearchFacilityQuery, PaginatedList<FacilityDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<PaginatedList<FacilityDto>> Handle(
        SearchFacilityQuery request,
        CancellationToken cancellationToken
    )
    {
        // Setup Query
        IQueryable<Facility> query = _context.Facilities.AsNoTracking();

        // Filter
        query = ParameterLogic(query, request);

        // Sort
        query = new DataSort<Facility>().Sort(query, $"{nameof(Facility.Name)} asc");

        // Execute 
        return await _mapper
            .ProjectTo<FacilityDto>(query)
            .PaginatedListAsync(request.Page, request.Limit, cancellationToken);
    }

    public static IQueryable<Facility> ParameterLogic(
        IQueryable<Facility> query,
        SearchFacilityQuery parameters
    )
    {
        if (!string.IsNullOrWhiteSpace(parameters.Query))
        {
            var search = parameters.Query.ToLower();

            query = query.Where(h =>
                (h.Name != null && EF.Functions.Like(h.Name, $"%{parameters.Query}%")) ||
                (h.City != null && EF.Functions.Like(h.City, $"%{parameters.Query}%")) ||
                (h.State != null && EF.Functions.Like(h.State, $"%{parameters.Query}%"))
            );
        }

        query = query.Where(h => h.IsActive);

        return query;
    }
}
