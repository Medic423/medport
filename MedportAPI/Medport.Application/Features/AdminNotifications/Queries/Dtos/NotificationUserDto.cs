using System;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class NotificationUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public string UserType { get; set; }
    public string Phone { get; set; }
    public bool EmailNotifications { get; set; }
    public bool SmsNotifications { get; set; }
    public DateTime CreatedAt { get; set; }
}
