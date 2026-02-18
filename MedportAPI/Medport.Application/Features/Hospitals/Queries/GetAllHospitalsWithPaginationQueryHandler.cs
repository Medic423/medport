using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Queries.Requests;
using Medport.Common.DTOs;
using Medport.Common.Helpers;
using Medport.Common.Mappings;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Hospitals.Queries;
public class GetAllHospitalsWithPaginationQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAllHospitalsWithPaginationQuery, PaginatedList<HospitalDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<PaginatedList<HospitalDto>> Handle(
        GetAllHospitalsWithPaginationQuery request,
        CancellationToken cancellationToken
    )
    {
        // Setup Query
        IQueryable<HospitalDto> query = _context.Hospitals.AsNoTracking();

        // Filter
        query = ParameterLogic(query, request);

        // Sort
        //if (!string.IsNullOrEmpty(request.order))
        //{
        //    query = new DataSort<HospitalDto>().Sort(query, request.OrderBy);
        //}

        // Execute 
        return await _mapper
            .ProjectTo<HospitalDto>(query)
            .PaginatedListAsync(request.Page, request.Limit, cancellationToken);
    }
}
