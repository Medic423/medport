using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;

public class EmsTripsDto
{
    public int TotalTrips { get; set; }
    public int CompletedTrips { get; set; }
    public int PendingTrips { get; set; }
    public int CancelledTrips { get; set; }
    public Dictionary<string, int> TripsByLevel { get; set; } = new();
    public Dictionary<string, int> TripsByPriority { get; set; } = new();
    public double AverageTripDurationMinutes { get; set; }
}
