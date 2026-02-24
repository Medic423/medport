using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using Medport.Application.Tracc.Features.Optimizations.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Handlers;

public class OptimizeRoutesCommandHandler : IRequestHandler<OptimizeRoutesCommand, OptimizationResultDto>
{
    private readonly IApplicationDbContext _context;

    public OptimizeRoutesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OptimizationResultDto> Handle(OptimizeRoutesCommand request, CancellationToken cancellationToken)
    {
        // Fetch unit
        var unit = await _context.Units.AsNoTracking().FirstOrDefaultAsync(u => u.Id.ToString() == request.UnitId, cancellationToken);

        // Fetch requests
        var reqIds = request.RequestIds?.ToList() ?? new List<string>();
        var transportRequests = await _context.TransportRequests.AsNoTracking()
            .Where(tr => reqIds.Contains(tr.Id.ToString()))
            .ToListAsync(cancellationToken);

        // Simplified scoring: revenue = baseRate per transport level, deadhead miles = 0
        var optimized = new List<object>();
        double totalRevenue = 0;
        double totalDeadhead = 0;
        double totalWait = 0;
        double avgScore = 0;

        foreach (var tr in transportRequests)
        {
            double revenue = tr?.TransportLevel switch
            {
                "BLS" => 150.0,
                "ALS" => 250.0,
                "CCT" => 400.0,
                _ => 150.0
            };
            totalRevenue += revenue;

            var score = revenue; // simplistic
            avgScore += score;

            optimized.Add(new {
                requestId = tr.Id,
                score,
                revenue,
                deadheadMiles = 0,
                waitTime = 0,
                overtimeRisk = 0,
                canHandle = true
            });
        }

        if (optimized.Count > 0) avgScore = avgScore / optimized.Count;

        return new OptimizationResultDto
        {
            UnitId = request.UnitId,
            OptimizedRequests = optimized,
            BackhaulPairs = new List<object>(),
            TotalRevenue = totalRevenue,
            TotalDeadheadMiles = totalDeadhead,
            TotalWaitTime = totalWait,
            AverageScore = avgScore
        };
    }
}
