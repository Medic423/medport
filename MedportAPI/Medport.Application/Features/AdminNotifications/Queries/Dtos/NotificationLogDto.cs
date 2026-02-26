namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class NotificationLogDto
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string NotificationType { get; set; }
    public string Channel { get; set; }
    public string Status { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime DeliveredAt { get; set; }
    public string ErrorMessage { get; set; }

    public NotificationUserDto User { get; set; }
}
