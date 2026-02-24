using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;
using Medport.Application.Tracc.Features.Analytics.Queries.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

/// <summary>
/// See <see cref="GetAnalyticsQueryHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record GetAnalyticsQuery() : IRequest<AnalyticsDto>;
