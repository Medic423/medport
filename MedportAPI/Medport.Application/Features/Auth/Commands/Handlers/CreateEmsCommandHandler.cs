using MediatR;
using Medport.Application.Tracc.Features.Auth.Commands.Requests;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Threading;
using System;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Auth.Commands.Handlers;

public class CreateEmsCommandHandler : IRequestHandler<CreateEmsCommand, UserDto>
{
    private readonly IApplicationDbContext _context;

    public CreateEmsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> Handle(CreateEmsCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password)) return null;

        var existingUser = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (existingUser != null) return null;

        var existingAgency = await _context.EmsAgencies.FirstOrDefaultAsync(a => a.Name == request.AgencyName, cancellationToken);
        if (existingAgency != null) return null;

        var hasher = new PasswordHasher<object>();
        var hashed = hasher.HashPassword(null, request.Password);

        var agency = new EmsAgency
        {
            Name = request.AgencyName,
            Address = request.Address ?? string.Empty,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Phone = request.Phone,
            Email = request.Email,
            IsActive = true,
            Status = "ACTIVE",
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AcceptsNotifications = true
        };

        _context.EmsAgencies.Add(agency);

        var user = new EmsUser
        {
            Email = request.Email.Trim(),
            Password = hashed,
            Name = request.Name,
            AgencyName = request.AgencyName,
            AgencyId = agency.Id,
            IsActive = true,
            OrgAdmin = true
        };

        _context.EmsUsers.Add(user);

        await _context.SaveChangesAsync(cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            UserType = "EMS",
            AgencyName = user.AgencyName,
            AgencyId = user.AgencyId,
            OrgAdmin = user.OrgAdmin
        };
    }
}
