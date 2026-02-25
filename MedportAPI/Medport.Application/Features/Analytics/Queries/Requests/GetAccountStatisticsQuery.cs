using MediatR;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetAccountStatisticsQuery() : IRequest<object>;
