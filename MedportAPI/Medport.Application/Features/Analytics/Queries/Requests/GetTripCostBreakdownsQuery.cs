using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetTripCostBreakdownsQuery(string TripId, int Limit = 100) : IRequest<IEnumerable<object>>;
