using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

/// <summary>
/// See <see cref="GetLogsQueryHandler"/>
/// </summary>
public record GetLogsQuery : IRequest<List<NotificationLogDto>>
{
    public int Days { get; init; } = 30;
    public int Limit { get; init; } = 100;
    public Guid? UserId { get; init; } = null;
    public string? Channel { get; init; } = null;
    public string? Status { get; init; } = null;
}
