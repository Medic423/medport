using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;

public class SendBroadcastCommand : IRequest<BroadcastResultDto>
{
    public required string NotificationType { get; set; }
    public string? Message { get; set; }
    public SendBroadcastCommandEmailDataBody? EmailData { get; set; }
    public SendBroadcastCommandSmsDataBody? SmsData { get; set; }
    public List<string> UserTypes { get; set; } = ["ADMIN", "USER", "HEALTHCARE", "EMS"];
}

public class SendBroadcastCommandEmailDataBody
{
    public string? Subject { get; set; }
    public string? Body { get; set; }
}

public class SendBroadcastCommandSmsDataBody
{
    public string? Message { get; set; }
}