using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class TemplatesDto
{
    public Dictionary<string, object> Email { get; set; }
    public Dictionary<string, object> Sms { get; set; }
}
