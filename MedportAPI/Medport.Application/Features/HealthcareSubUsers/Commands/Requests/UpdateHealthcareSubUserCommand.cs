using MediatR;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;

public class UpdateHealthcareSubUserCommand : IRequest<HealthcareSubUserDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public bool? IsActive { get; set; }

    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
