using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Common.DTOs;
using Medport.Application.Tracc.Features.Units.Queries.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Queries.Handlers;

/// <summary>
/// Handler for retrieving all units with pagination
/// </summary>
[ExcludeFromCodeCoverage]
public class GetAllUnitsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAllUnitsQuery, PaginatedResult<UnitDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<PaginatedResult<UnitDto>> Handle(GetAllUnitsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Units.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.AgencyId))
        {
            query = query.Where(u => u.AgencyId == request.AgencyId);
        }

        if (!string.IsNullOrWhiteSpace(request.UnitType))
        {
            query = query.Where(u => u.UnitType == request.UnitType);
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query = query.Where(u => u.CurrentStatus == request.Status);
        }

        // Get total count
        var total = await query.CountAsync(cancellationToken);

        // Apply pagination
        var skip = (request.Page - 1) * request.Limit;
        var items = await query
            .OrderBy(u => u.UnitNumber)
            .Skip(skip)
            .Take(request.Limit)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var unitDtos = _mapper.Map<List<UnitDto>>(items);

        // Calculate total pages
        var totalPages = (int)Math.Ceiling((double)total / request.Limit);

        return new PaginatedResult<UnitDto>
        {
            Items = unitDtos,
            TotalCount = total,
            TotalPages = totalPages,
            Page = request.Page,
            Limit = request.Limit
        };
    }
}