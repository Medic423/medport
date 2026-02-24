using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Handlers;

public class PreviewOptimizationCommandHandler : IRequestHandler<PreviewOptimizationCommand, object>
{
    public Task<object> Handle(PreviewOptimizationCommand request, CancellationToken cancellationToken)
    {
        // Simplified preview: return basic summary
        var result = new {
            totalUnits = request.UnitIds == null ? 0 : System.Linq.Enumerable.Count(request.UnitIds),
            totalRequests = request.RequestIds == null ? 0 : System.Linq.Enumerable.Count(request.RequestIds),
            settings = request.Settings
        };

        return Task.FromResult<object>(result);
    }
}
