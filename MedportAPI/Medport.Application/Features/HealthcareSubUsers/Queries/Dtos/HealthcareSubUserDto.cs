using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;

public class HealthcareSubUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
