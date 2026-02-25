using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetTccOverviewQuery() : IRequest<TccOverviewDto>;
