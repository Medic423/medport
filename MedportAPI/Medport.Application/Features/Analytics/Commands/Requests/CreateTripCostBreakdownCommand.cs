using MediatR;

namespace Medport.Application.Tracc.Features.Analytics.Commands.Requests;

public class CreateTripCostBreakdownCommand : IRequest<object>
{
    public string TripId { get; set; }
    public object BreakdownData { get; set; }
}
