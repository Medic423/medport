using MediatR;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

public class LoginCommand : IRequest<AuthResultDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
}
