using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Domain.Interfaces;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Queries.Handlers;

/// <summary>
/// Handler for retrieving a unit by ID
/// </summary>
[ExcludeFromCodeCoverage]
public class GetUnitByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetUnitByIdQuery, UnitDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<UnitDto> Handle(GetUnitByIdQuery request, CancellationToken cancellationToken)
    {
        // Find the unit
        var unit = await _context.Units.FindAsync([request.UnitId], cancellationToken: cancellationToken);
        if (unit == null)
        {
            throw new KeyNotFoundException($"Unit with ID {request.UnitId} not found");
        }

        // Map to DTO
        var unitDto = _mapper.Map<UnitDto>(unit);

        return unitDto;
    }
}