namespace Medport.Application.Tracc.Features.Auth.Queries.Dtos;

public class AuthResultDto
{
    public UserDto User { get; set; }
    public string Token { get; set; }
    public bool MustChangePassword { get; set; }
}
