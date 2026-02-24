using MediatR;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Requests;

public record GetPerformanceQuery(string Timeframe = "24h", string UnitId = null) : IRequest<object>;
