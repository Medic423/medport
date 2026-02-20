namespace Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
public class AgencyDto
{
    public Guid Id { get; set; }

    public Guid AssignedUnitId { get; set; }

    public Guid AgencyId { get; set; }
    
    public Guid TripId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }


    public string Response { get; set; }

    public DateTime ResponseTimestamp { get; set; }

    public string ResponseNotes { get; set; }

    public DateTime EstimatedArrival { get; set; }

    public bool IsSelected { get; set; }

}
