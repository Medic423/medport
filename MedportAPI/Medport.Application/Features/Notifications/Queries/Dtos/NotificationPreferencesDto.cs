using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Dtos;

public class NotificationPreferencesDto
{
    public bool EmailEnabled { get; set; }
    public bool SmsEnabled { get; set; }
    public string Phone { get; set; }
    public Dictionary<string, NotificationTypePreferenceDto> NotificationTypes { get; set; } = new();
}

public class NotificationTypePreferenceDto
{
    public bool Email { get; set; }
    public bool Sms { get; set; }
}
