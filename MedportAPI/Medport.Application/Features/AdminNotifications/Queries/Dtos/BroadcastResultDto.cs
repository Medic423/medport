using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class BroadcastResultDto
{
    public int TotalSent { get; set; }
    public int Successful { get; set; }
    public int Failed { get; set; }
    public IEnumerable<object> Results { get; set; }
}
