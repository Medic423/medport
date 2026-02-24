using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;

public class CreateHealthcareSubUserResultDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public string TempPassword { get; set; }
}
