using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Units.Commands.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Domain.Interfaces;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Commands.Handlers;

/// <summary>
/// Handler for updating a unit's status
/// </summary>
[ExcludeFromCodeCoverage]
public class UpdateUnitStatusCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<UpdateUnitStatusCommand, UnitDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<UnitDto> Handle(UpdateUnitStatusCommand request, CancellationToken cancellationToken)
    {
        // Find the unit
        if (!Guid.TryParse(request.UnitId, out var unitGuid))
        {
            throw new ArgumentException("Invalid unit id");
        }

        var unit = await _context.Units.FindAsync(new object[] { unitGuid }, cancellationToken: cancellationToken);
        if (unit == null)
        {
            throw new KeyNotFoundException($"Unit with ID {request.UnitId} not found");
        }

        // Update status
        unit.CurrentStatus = request.Status;
        unit.UpdatedAt = DateTime.UtcNow;

        // Save changes
        await _context.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var unitDto = _mapper.Map<UnitDto>(unit);

        return unitDto;
    }
}