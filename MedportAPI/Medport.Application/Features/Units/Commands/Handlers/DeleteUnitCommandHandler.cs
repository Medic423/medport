using MediatR;
using Medport.Application.Tracc.Features.Units.Commands.Requests;
using Medport.Domain.Interfaces;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Units.Commands.Handlers;

/// <summary>
/// Handler for deleting a unit
/// </summary>
[ExcludeFromCodeCoverage]
public class DeleteUnitCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteUnitCommand, bool>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<bool> Handle(DeleteUnitCommand request, CancellationToken cancellationToken)
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

        // Remove from database
        _context.Units.Remove(unit);

        // Save changes
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}