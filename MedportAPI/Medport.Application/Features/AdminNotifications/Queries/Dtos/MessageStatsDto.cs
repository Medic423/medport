using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class MessageStatsDto
{
    public int TotalSent { get; set; }
    public int TotalDelivered { get; set; }
    public int TotalFailed { get; set; }
    public double DeliveryRate { get; set; }

    public ChannelStatsDto ByChannel { get; set; } = new();

    public Dictionary<string, MessageCountDto> ByUser { get; set; } = new();

    public Dictionary<string, MessageCountDto> ByType { get; set; } = new();
}

public class ChannelStatsDto
{
    public MessageCountDto Email { get; set; } = new();
    public MessageCountDto Sms { get; set; } = new();
}

public class MessageCountDto
{
    public int Sent { get; set; }
    public int Delivered { get; set; }
    public int Failed { get; set; }
}