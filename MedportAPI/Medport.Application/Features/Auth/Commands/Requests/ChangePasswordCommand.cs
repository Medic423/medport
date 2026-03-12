using MediatR;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

public class ChangePasswordCommand : IRequest<bool>
{
    public required string EncodedAuth { get; set; }
    public required string UserType { get; set; }
    public required string NewPasswordEncoded { get; set; }
}
