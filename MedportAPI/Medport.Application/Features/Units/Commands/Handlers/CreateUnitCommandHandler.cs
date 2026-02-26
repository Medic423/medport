using MediatR;
using Medport.Application.Tracc.Features.Units.Commands.Requests;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using Medport.Domain.Interfaces;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Commands.Handlers;

/// <summary>
/// Handler for creating a new unit. Ported from backend unitService.createUnit route logic.
/// Resolves agency id from caller context when not explicitly provided.
/// </summary>
[ExcludeFromCodeCoverage]
public class CreateUnitCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateUnitCommand, UnitDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<UnitDto> Handle(CreateUnitCommand request, CancellationToken cancellationToken)
    {
        // Resolve agencyId: prefer explicit, otherwise use caller context when EMS
        Guid? agencyId = request.AgencyId;

        if (!agencyId.HasValue)
        {
            if (string.Equals(request.CallerUserType, "EMS", StringComparison.OrdinalIgnoreCase))
            {
                if (request.CallerAgencyId.HasValue) agencyId = request.CallerAgencyId;
                else if (request.CallerUserId.HasValue) agencyId = request.CallerUserId;
            }
        }

        if (!agencyId.HasValue)
        {
            throw new InvalidOperationException("Agency ID is required to create a unit");
        }

        // Validate agency exists
        var agency = await _context.EmsAgencies.FindAsync(new object[] { agencyId.Value }, cancellationToken: cancellationToken);
        if (agency == null)
        {
            throw new KeyNotFoundException($"Agency with ID {agencyId} not found");
        }

        // Determine initial status
        var initialStatus = request.Status ?? request.CurrentStatus ?? "AVAILABLE";

        // Compose capabilities
        var caps = new List<string>();
        if (request.Capabilities != null) caps.AddRange(request.Capabilities);
        if (request.CustomCapabilities != null) caps.AddRange(request.CustomCapabilities);

        var unit = new Domain.Entities.Unit
        {
            AgencyId = agencyId.Value,
            UnitNumber = request.UnitNumber,
            Type = request.UnitType,
            Capabilities = caps,
            Status = initialStatus,
            CurrentStatus = initialStatus,
            CrewSize = 2,
            Equipment = new List<string>(),
            IsActive = request.IsActive,
            LastMaintenance = DateTime.UtcNow,
            NextMaintenance = DateTime.UtcNow.AddDays(30),
            LastStatusUpdate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Units.AddAsync(unit, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = new UnitDto
        {
            Id = unit.Id,
            AgencyId = unit.AgencyId,
            UnitNumber = unit.UnitNumber,
            UnitType = unit.Type,
            Capabilities = unit.Capabilities,
            CurrentStatus = unit.CurrentStatus,
            IsActive = unit.IsActive,
            LastMaintenance = unit.LastMaintenance,
            NextMaintenance = unit.NextMaintenance,
            LastStatusUpdate = unit.LastStatusUpdate,
            CreatedAt = unit.CreatedAt,
            UpdatedAt = unit.UpdatedAt
        };

        return dto;
    }
}
