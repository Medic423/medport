using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;

public class ResetEmsSubUserResultDto
{
    public Guid Id { get; set; }
    public string TempPassword { get; set; }
}
