using System;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Dtos;

public class NotificationDto
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public bool Read { get; set; }
    public DateTime CreatedAt { get; set; }
}
