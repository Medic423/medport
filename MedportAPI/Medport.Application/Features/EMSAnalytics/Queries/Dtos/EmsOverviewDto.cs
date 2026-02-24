using System;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;

public class EmsOverviewDto
{
    public int TotalTrips { get; set; }
    public int CompletedTrips { get; set; }
    public int PendingTrips { get; set; }
    public double Efficiency { get; set; }
    public double AverageResponseTimeMinutes { get; set; }
    public string AgencyName { get; set; }
}
