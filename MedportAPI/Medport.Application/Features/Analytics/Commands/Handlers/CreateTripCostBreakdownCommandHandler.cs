using MediatR;
using Medport.Application.Tracc.Features.Analytics.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Analytics.Commands.Handlers;

public class CreateTripCostBreakdownCommandHandler : IRequestHandler<CreateTripCostBreakdownCommand, object>
{
    public Task<object> Handle(CreateTripCostBreakdownCommand request, CancellationToken cancellationToken)
    {
        // Placeholder: accept input and echo back with id
        var result = new { id = $"breakdown-{System.DateTime.UtcNow.Ticks}", tripId = request.TripId, data = request.BreakdownData };
        return Task.FromResult<object>(result);
    }
}
