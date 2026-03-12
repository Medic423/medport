using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Requests;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using Medport.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Commands.Handlers;

public class CreateHealthcareSubUserCommandHandler : IRequestHandler<CreateHealthcareSubUserCommand, CreateHealthcareSubUserResultDto>
{
    private readonly IApplicationDbContext _context;

    public CreateHealthcareSubUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    private static string GenerateTempPassword()
    {
        var upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        var lower = "abcdefghijkmnopqrstuvwxyz";
        var digits = "23456789";
        var all = upper + lower + digits;
        var rnd = new Random();
        var outp = "";
        outp += upper[rnd.Next(upper.Length)];
        outp += lower[rnd.Next(lower.Length)];
        outp += digits[rnd.Next(digits.Length)];
        for (int i = 0; i < 9; i++) outp += all[rnd.Next(all.Length)];
        return outp;
    }

    public async Task<CreateHealthcareSubUserResultDto> Handle(CreateHealthcareSubUserCommand request, CancellationToken cancellationToken)
    {
        //if (request.CallerUserType != "HEALTHCARE" && request.CallerUserType != "ADMIN")
        //    throw new UnauthorizedAccessException("Forbidden");

        //HealthcareUser parent = null;
        //if (request.CallerUserType == "HEALTHCARE")
        //{
        //    parent = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
        //    if (parent == null) throw new UnauthorizedAccessException("Parent healthcare user not found");
        //}
        //else if (request.CallerUserType == "ADMIN")
        //{
        //    if (string.IsNullOrEmpty(request.FacilityName)) throw new ArgumentException("facilityName is required when admin creates sub-user");
        //    parent = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.FacilityName == request.FacilityName && !u.IsSubUser, cancellationToken);
        //    if (parent == null) throw new InvalidOperationException($"No healthcare parent found with facility name: {request.FacilityName}");
        //}

        //var existing = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        //if (existing != null) throw new InvalidOperationException("Email already in use");

        //var tempPassword = GenerateTempPassword();
        //var hash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

        //var created = new HealthcareUser
        //{
        //    Email = request.Email,
        //    Password = hash,
        //    Name = request.Name,
        //    FacilityName = parent?.FacilityName ?? "",
        //    FacilityType = parent?.FacilityType ?? "Healthcare",
        //    UserType = "HEALTHCARE",
        //    IsActive = true,
        //    IsSubUser = true,
        //    ParentUserId = parent?.Id,
        //    MustChangePassword = true
        //};

        //_context.HealthcareUsers.Add(created);
        //await _context.SaveChangesAsync(cancellationToken);

        //return new CreateHealthcareSubUserResultDto
        //{
        //    Id = created.Id,
        //    Email = created.Email,
        //    Name = created.Name,
        //    TempPassword = tempPassword
        //};

        return null;
    }
}
