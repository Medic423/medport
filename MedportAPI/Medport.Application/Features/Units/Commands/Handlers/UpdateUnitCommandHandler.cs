using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Units.Commands.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Domain.Interfaces;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Commands.Handlers;

/// <summary>
/// Handler for updating an existing unit
/// </summary>
[ExcludeFromCodeCoverage]
public class UpdateUnitCommandHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<UpdateUnitCommand, UnitDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<UnitDto> Handle(UpdateUnitCommand request, CancellationToken cancellationToken)
    {
        // Find the unit
        if (!Guid.TryParse(request.UnitId, out var unitGuid))
        {
            throw new ArgumentException("Invalid unit id");
        }

        var unit = await _context.Units.FindAsync([unitGuid], cancellationToken: cancellationToken);
        if (unit == null)
        {
            throw new KeyNotFoundException($"Unit with ID {request.UnitId} not found");
        }

        // Update properties if provided
        if (!string.IsNullOrWhiteSpace(request.UnitNumber))
        {
            unit.UnitNumber = request.UnitNumber;
        }

        //if (!string.IsNullOrWhiteSpace(request.UnitType))
        //{
        //    unit.UnitType = request.UnitType;
        //}

        //if (!string.IsNullOrWhiteSpace(request.Description))
        //{
        //    unit.Description = request.Description;
        //}

        if (request.Capabilities != null && request.Capabilities.Any())
        {
            unit.Capabilities = request.Capabilities;
        }

        if (!string.IsNullOrWhiteSpace(request.CurrentStatus))
        {
            unit.CurrentStatus = request.CurrentStatus;
        }

        if (request.IsActive.HasValue)
        {
            unit.IsActive = request.IsActive.Value;
        }

        // Update timestamp
        unit.UpdatedAt = DateTime.UtcNow;

        // Save changes
        await _context.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var unitDto = _mapper.Map<UnitDto>(unit);

        return unitDto;
    }
}