using MediatR;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Requests;

public record GetNotificationPreferencesQuery() : IRequest<NotificationPreferencesDto>;
