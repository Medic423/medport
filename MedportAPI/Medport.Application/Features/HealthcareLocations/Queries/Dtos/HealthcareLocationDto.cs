namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;

public class HealthcareLocationDto
{
    public Guid Id { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }

    public string LocationName { get; set; }
    public string FacilityType { get; set; }

    public string Phone { get; set; }

    public bool IsActive { get; set; }
    public bool IsPrimary { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string Email { get; set; }

    public Guid? HealthcareUserId { get; set; }
}
