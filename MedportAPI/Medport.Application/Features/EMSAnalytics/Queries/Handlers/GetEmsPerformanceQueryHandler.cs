using MediatR;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Handlers;

public class GetEmsPerformanceQueryHandler : IRequestHandler<GetEmsPerformanceQuery, EmsPerformanceDto>
{
    private readonly IApplicationDbContext _context;

    public GetEmsPerformanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmsPerformanceDto> Handle(GetEmsPerformanceQuery request, CancellationToken cancellationToken)
    {
        //if (request.AgencyId == Guid.Empty) return new EmsPerformanceDto();

        //var totalTrips = await _context.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId, cancellationToken);
        //var completedTrips = await _context.TransportRequests.CountAsync(t => t.AssignedAgencyId == request.AgencyId && t.Status == "COMPLETED", cancellationToken);

        //var completionRate = totalTrips > 0 ? (double)completedTrips / totalTrips : 0;

        //return new EmsPerformanceDto
        //{
        //    TotalTrips = totalTrips,
        //    CompletedTrips = completedTrips,
        //    CompletionRate = completionRate,
        //    Message = "Simplified performance metrics - complex calculations removed for Phase 3"
        //};

        return null;
    }
}
