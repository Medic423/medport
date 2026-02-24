using System;

namespace Medport.Application.Tracc.Features.PickupLocations.Queries.Dtos;

public class PickupLocationDto
{
    public Guid Id { get; set; }
    public Guid HospitalId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string ContactPhone { get; set; }
    public string ContactEmail { get; set; }
    public string Floor { get; set; }
    public string Room { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
