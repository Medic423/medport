using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Handlers;

public class MultiUnitOptimizeCommandHandler : IRequestHandler<MultiUnitOptimizeCommand, object>
{
    public Task<object> Handle(MultiUnitOptimizeCommand request, CancellationToken cancellationToken)
    {
        // Simplified: return counts
        var result = new {
            totalUnits = request.UnitIds == null ? 0 : System.Linq.Enumerable.Count(request.UnitIds),
            totalRequests = request.RequestIds == null ? 0 : System.Linq.Enumerable.Count(request.RequestIds)
        };

        return Task.FromResult<object>(result);
    }
}
