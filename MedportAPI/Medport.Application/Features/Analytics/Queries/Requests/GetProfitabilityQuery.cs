using MediatR;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetProfitabilityQuery(string Period = "month") : IRequest<object>;
