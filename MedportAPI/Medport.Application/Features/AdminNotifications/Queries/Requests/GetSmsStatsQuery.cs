using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

public record GetSmsStatsQuery(int Days) : IRequest<SmsStatsDto>;
