using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class AdminCreateUserCommandHandler : IRequestHandler<AdminCreateUserCommand, UserDto>
{
    private readonly IApplicationDbContext _context;

    public AdminCreateUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> Handle(AdminCreateUserCommand request, CancellationToken cancellationToken)
    {
        //var hasher = new PasswordHasher<object>();
        //var hashed = hasher.HashPassword(null, request.Password);

        //var user = new CenterUser
        //{
        //    Email = request.Email,
        //    Password = hashed,
        //    Name = request.Name,
        //    UserType = request.UserType,
        //    IsActive = true
        //};

        //_context.CenterUsers.Add(user);
        //await _context.SaveChangesAsync(cancellationToken);

        //return new UserDto { Id = user.Id, Email = user.Email, Name = user.Name, UserType = user.UserType };
        return null;
    }
}
