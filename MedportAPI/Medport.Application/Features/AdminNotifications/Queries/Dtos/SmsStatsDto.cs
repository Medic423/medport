namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class SmsStatsDto
{
    public int TotalSent { get; set; }
    public int TotalDelivered { get; set; }
    public int TotalFailed { get; set; }
    public double DeliveryRate { get; set; }
    public object CostStats { get; set; }
}
