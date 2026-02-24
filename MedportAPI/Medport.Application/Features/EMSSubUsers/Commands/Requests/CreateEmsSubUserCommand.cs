using MediatR;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;

public class CreateEmsSubUserCommand : IRequest<CreateEmsSubUserResultDto>
{
    public string Email { get; set; }
    public string Name { get; set; }
    public string AgencyName { get; set; } // required when Admin creates

    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
