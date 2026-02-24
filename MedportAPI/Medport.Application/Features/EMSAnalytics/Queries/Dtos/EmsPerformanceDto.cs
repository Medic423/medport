namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;

public class EmsPerformanceDto
{
    public int TotalTrips { get; set; }
    public int CompletedTrips { get; set; }
    public double CompletionRate { get; set; }
    public string Message { get; set; }
}
