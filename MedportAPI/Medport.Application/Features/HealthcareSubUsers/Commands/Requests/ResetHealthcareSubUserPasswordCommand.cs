using MediatR;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;

public class ResetHealthcareSubUserPasswordCommand : IRequest<ResetHealthcareSubUserResultDto>
{
    public Guid Id { get; set; }
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
