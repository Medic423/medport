using MediatR;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;

public class DeleteHealthcareSubUserCommand : IRequest
{
    public Guid Id { get; set; }
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
