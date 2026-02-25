using MediatR;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetCostAnalysisQuery(System.DateTime? StartDate = null, System.DateTime? EndDate = null) : IRequest<object>;
