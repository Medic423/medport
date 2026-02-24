using MediatR;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Requests;

public record MarkAllNotificationsReadCommand() : IRequest<int>;
