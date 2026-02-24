using MediatR;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Requests;

public record MarkNotificationReadCommand(string Id) : IRequest<bool>;
