using MediatR;
using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;

public class DeleteEmsSubUserCommand : IRequest
{
    public Guid Id { get; set; }

    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
