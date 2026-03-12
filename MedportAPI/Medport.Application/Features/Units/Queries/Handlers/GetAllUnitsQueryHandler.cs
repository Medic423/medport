using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Application.Tracc.Features.Units.Queries.Requests;
using Medport.Common.DTOs;
using Medport.Common.Mappings;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Queries.Handlers;

/// <summary>
/// Handler for retrieving all units with pagination
/// </summary>
[ExcludeFromCodeCoverage]
public class GetAllUnitsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAllUnitsQuery, PaginatedList<UnitDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<PaginatedList<UnitDto>> Handle(GetAllUnitsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Units.AsNoTracking();

        query = ParameterLogic(query,request);
        
        query = query.OrderBy(u => u.UnitNumber);

        return await _mapper
            .ProjectTo<UnitDto>(query)
            .PaginatedListAsync(request.Page, request.Limit, cancellationToken);
    }

    public static IQueryable<Domain.Entities.Unit> ParameterLogic(IQueryable<Domain.Entities.Unit> query, GetAllUnitsQuery request)
    {
        // Apply filters
        if (request.AgencyId != Guid.Empty)
        {
            //query = query.Where(u => u.AgencyId == request.AgencyId);
        }

        //if (!string.IsNullOrWhiteSpace(request.UnitType))
        //{
        //    query = query.Where(u => u.UnitType == request.UnitType);
        //}

        //if (!string.IsNullOrWhiteSpace(request.Status))
        //{
        //    query = query.Where(u => u.CurrentStatus == request.Status);
        //}

        return query;
    }
}