using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;

public class ResetHealthcareSubUserResultDto
{
    public Guid Id { get; set; }
    public string TempPassword { get; set; }
}
