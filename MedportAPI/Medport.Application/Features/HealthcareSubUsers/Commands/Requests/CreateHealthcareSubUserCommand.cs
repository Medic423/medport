using MediatR;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;

public class CreateHealthcareSubUserCommand : IRequest<CreateHealthcareSubUserResultDto>
{
    public string Email { get; set; }
    public string Name { get; set; }

    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }

    // For admin-created sub-users, specify facility name to locate parent
    public string FacilityName { get; set; }
}
