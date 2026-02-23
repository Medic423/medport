using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Units.Commands.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Commands.Handlers;

/// <summary>
/// Handler for creating a new unit
/// Implements full CQRS pattern with dependency injection
/// </summary>
[ExcludeFromCodeCoverage]
public class CreateUnitCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<CreateUnitCommand, UnitDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<UnitDto> Handle(CreateUnitCommand request, CancellationToken cancellationToken)
    {
        // Validate agency exists
        var agency = await _context.EmsAgencies.FindAsync(new object[] { request.AgencyId }, cancellationToken: cancellationToken);
        if (agency == null)
        {
            throw new KeyNotFoundException($"Agency with ID {request.AgencyId} not found");
        }

        // Map command to entity
        var unit = _mapper.Map<Unit>(request);

        // Set default values
        unit.CreatedAt = DateTime.UtcNow;
        unit.UpdatedAt = DateTime.UtcNow;

        // Add to database
        await _context.Units.AddAsync(unit, cancellationToken);

        // Save changes
        await _context.SaveChangesAsync(cancellationToken);

        // Map entity back to DTO
        var unitDto = _mapper.Map<UnitDto>(unit);

        return unitDto;
    }
}