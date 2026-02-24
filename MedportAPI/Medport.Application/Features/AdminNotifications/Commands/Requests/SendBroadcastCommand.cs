using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;

public class SendBroadcastCommand : IRequest<BroadcastResultDto>
{
    public string NotificationType { get; set; }
    public object EmailData { get; set; }
    public object SmsData { get; set; }
    public IEnumerable<string> UserTypes { get; set; } = new List<string>{ "ADMIN", "USER", "HEALTHCARE", "EMS" };
}
