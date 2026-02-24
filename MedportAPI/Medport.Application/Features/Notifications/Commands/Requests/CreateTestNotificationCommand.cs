using MediatR;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Requests;

public record CreateTestNotificationCommand(string Type = "info", string Title = "Test Notification", string Message = "This is a test notification") : IRequest<string>;
