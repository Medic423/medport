using MediatR;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Requests;

public record UpdateNotificationPreferencesCommand(NotificationPreferencesDto Preferences) : IRequest<NotificationPreferencesDto>;
