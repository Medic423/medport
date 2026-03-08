using System;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;

public class HealthcareLocationStatisticsDto
{
    public Guid Id { get; set; }
    public string LocationName { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string Phone { get; set; }
    public bool IsActive { get; set; }
    public bool IsPrimary { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public LocationStatsDto Statistics { get; set; }
}

public class LocationStatsDto
{
    public int TotalTrips { get; set; }
    public int PendingTrips { get; set; }
    public int CompletedTrips { get; set; }
}
