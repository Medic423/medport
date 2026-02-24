using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.Maintenance.Commands.Requests;
using Medport.Application.Tracc.Features.Maintenance.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System;

namespace Medport.Application.Tracc.Features.Maintenance.Commands.Handlers;

public class ResetDevStateCommandHandler : IRequestHandler<ResetDevStateCommand, ResetDevStateResultDto>
{
    private readonly IApplicationDbContext _context;

    public ResetDevStateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ResetDevStateResultDto> Handle(ResetDevStateCommand request, CancellationToken cancellationToken)
    {
        // Cancel trips with active statuses
        var activeStatuses = new[] { "PENDING", "ACCEPTED", "IN_PROGRESS" };

        var toCancel = await _context.TransportRequests
            .Where(t => activeStatuses.Contains(t.Status))
            .ToListAsync(cancellationToken);

        foreach (var tr in toCancel)
        {
            tr.Status = "CANCELLED";
            tr.CompletionTimestamp = DateTime.UtcNow;
        }

        // Clear assignedUnitId for non-completed requests
        var toClear = await _context.TransportRequests
            .Where(t => t.Status != "COMPLETED")
            .ToListAsync(cancellationToken);

        foreach (var tr in toClear)
        {
            tr.AssignedUnitId = null;
        }

        // Free up all units
        var units = await _context.Units.ToListAsync(cancellationToken);
        foreach (var u in units)
        {
            u.Status = "AVAILABLE";
            u.CurrentStatus = "AVAILABLE";
        }

        var result = new ResetDevStateResultDto
        {
            TripsCancelled = toCancel.Count,
            TripsCleared = toClear.Count,
            UnitsFreed = units.Count
        };

        await _context.SaveChangesAsync(cancellationToken);

        return result;
    }
}
