using MediatR;

namespace Medport.Application.Tracc.Features.ProductionUnits.Queries.Requests;

public record GetProductionUnitAnalyticsQuery() : IRequest<object>;
