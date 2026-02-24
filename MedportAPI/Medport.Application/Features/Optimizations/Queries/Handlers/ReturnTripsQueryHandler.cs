using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Handlers;

public class ReturnTripsQueryHandler : IRequestHandler<ReturnTripsQuery, object>
{
    public Task<object> Handle(ReturnTripsQuery request, CancellationToken cancellationToken)
    {
        // Simplified placeholder: no DB dependency here
        var result = new {
            returnTrips = new object[0],
            statistics = new { total = 0 }
        };

        return Task.FromResult<object>(result);
    }
}
