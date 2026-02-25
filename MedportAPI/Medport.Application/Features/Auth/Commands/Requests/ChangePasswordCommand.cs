using MediatR;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

public class ChangePasswordCommand : IRequest<bool>
{
    public string Email { get; set; }
    public string UserType { get; set; }
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}
