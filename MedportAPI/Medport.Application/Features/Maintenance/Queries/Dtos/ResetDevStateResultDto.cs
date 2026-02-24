namespace Medport.Application.Tracc.Features.Maintenance.Queries.Dtos;

public class ResetDevStateResultDto
{
    public int TripsCancelled { get; set; }
    public int TripsCleared { get; set; }
    public int UnitsFreed { get; set; }
}
