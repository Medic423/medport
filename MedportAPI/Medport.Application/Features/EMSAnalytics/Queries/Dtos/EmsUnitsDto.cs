using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;

public class EmsUnitsDto
{
    public int TotalUnits { get; set; }
    public int ActiveUnits { get; set; }
    public int AvailableUnits { get; set; }
    public int CommittedUnits { get; set; }
    public int OutOfServiceUnits { get; set; }
    public double AverageUtilization { get; set; }
    public IEnumerable<object> TopPerformingUnits { get; set; }
}
