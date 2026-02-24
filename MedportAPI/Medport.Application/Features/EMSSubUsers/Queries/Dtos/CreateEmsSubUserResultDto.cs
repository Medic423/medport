using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;

public class CreateEmsSubUserResultDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public string TempPassword { get; set; }
}
