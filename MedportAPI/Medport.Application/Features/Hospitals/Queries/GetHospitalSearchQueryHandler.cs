using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Queries.Requests;
using Medport.Common.DTOs;
using Medport.Common.Helpers;
using Medport.Common.Mappings;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Hospitals.Queries;

public class GetHospitalSearchQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetHospitalSearchQuery, PaginatedList<HospitalDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    //public static IQueryable<Hospital> ParameterLogic(
    //    IQueryable<Hospital> query,
    //    GetHospitalSearchQuery parameters
    //)
    //{
    //    if (!string.IsNullOrWhiteSpace(parameters.Query))
    //    {
    //        var search = parameters.Query.ToLower();

    //        query = query.Where(h =>
    //            (h.Name != null && EF.Functions.Like(h.Name, $"%{parameters.Query}%")) ||
    //            (h.City != null && EF.Functions.Like(h.City, $"%{parameters.Query}%")) ||
    //            (h.State != null && EF.Functions.Like(h.State, $"%{parameters.Query}%"))
    //        );
    //    }

    //    query = query.Where(h => h.IsActive);

    //    return query;
    //}

    public async Task<PaginatedList<HospitalDto>> Handle(
        GetHospitalSearchQuery request,
        CancellationToken cancellationToken
    )
    {
        //// Setup Query
        //IQueryable<Hospital> query = _context.Hospitals.AsNoTracking();

        //// Filter
        //query = ParameterLogic(query, request);

        //// Sort
        //query = new DataSort<Hospital>().Sort(query, $"{nameof(Hospital.Name)} asc");

        //// Execute 
        //return await _mapper
        //    .ProjectTo<HospitalDto>(query)
        //    .PaginatedListAsync(request.Page, request.Limit, cancellationToken);
        return null;
    }
}
