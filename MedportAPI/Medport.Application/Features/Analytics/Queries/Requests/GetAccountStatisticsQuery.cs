using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetAccountStatisticsQuery() : IRequest<AnalyticsDto>;
