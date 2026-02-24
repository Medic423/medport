using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Dtos;

public class OptimizationResultDto
{
    public string UnitId { get; set; }
    public IEnumerable<object> OptimizedRequests { get; set; }
    public IEnumerable<object> BackhaulPairs { get; set; }
    public double TotalRevenue { get; set; }
    public double TotalDeadheadMiles { get; set; }
    public double TotalWaitTime { get; set; }
    public double AverageScore { get; set; }
}
