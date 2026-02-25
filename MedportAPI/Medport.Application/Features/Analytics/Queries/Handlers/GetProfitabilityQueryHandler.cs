using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetProfitabilityQueryHandler : IRequestHandler<GetProfitabilityQuery, object>
{
    public Task<object> Handle(GetProfitabilityQuery request, CancellationToken cancellationToken)
    {
        var result = new { period = request.Period, revenue = 0.0, profit = 0.0 };
        return Task.FromResult<object>(result);
    }
}
