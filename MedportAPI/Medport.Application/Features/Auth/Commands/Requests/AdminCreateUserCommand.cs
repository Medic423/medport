using MediatR;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

public class AdminCreateUserCommand : IRequest<UserDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
    public string UserType { get; set; } // ADMIN or USER
}
