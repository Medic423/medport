using MediatR;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

public class ResetPasswordCommand : IRequest<string>
{
    public string Domain { get; set; } // CENTER|HEALTHCARE|EMS
    public System.Guid Id { get; set; }
}
