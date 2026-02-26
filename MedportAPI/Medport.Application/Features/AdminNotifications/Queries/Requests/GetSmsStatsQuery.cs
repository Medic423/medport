using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

/// <summary>
/// See <see cref="GetSmsStatsQueryHandler"/>
/// </summary>
public record GetSmsStatsQuery(int Days) : IRequest<SmsStatsDto>;
