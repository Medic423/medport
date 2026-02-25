using System;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Dtos;

public class TccOverviewDto
{
    public int TotalTrips { get; set; }
    public int PendingTrips { get; set; }
    public int CompletedTrips { get; set; }
    public int ActiveAgencies { get; set; }
    public int ActiveHospitals { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
