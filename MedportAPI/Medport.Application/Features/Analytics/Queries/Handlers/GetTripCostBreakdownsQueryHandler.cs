using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetTripCostBreakdownsQueryHandler : IRequestHandler<GetTripCostBreakdownsQuery, IEnumerable<object>>
{
    public Task<IEnumerable<object>> Handle(GetTripCostBreakdownsQuery request, CancellationToken cancellationToken)
    {
        // Placeholder - no cost breakdowns stored
        return Task.FromResult<IEnumerable<object>>(new List<object>());
    }
}
