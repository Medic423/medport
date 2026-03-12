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

public class CreateHealthcareCommandHandler : IRequestHandler<CreateHealthcareCommand, UserDto>
{
    private readonly IApplicationDbContext _context;

    public CreateHealthcareCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> Handle(CreateHealthcareCommand request, CancellationToken cancellationToken)
    {
        //// Basic validation
        //if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password)) return null;

        //// Check existing
        //var exists = await _context.HealthcareUsers.FindAsync(new object[] { request.Email }, cancellationToken).ConfigureAwait(false);
        //// Note: FindAsync by key - email is not key; do query
        //var existing = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        //if (existing != null) return null;

        //var hasher = new PasswordHasher<object>();
        //var hashed = hasher.HashPassword(null, request.Password);

        //var user = new HealthcareUser
        //{
        //    Email = request.Email.Trim(),
        //    Password = hashed,
        //    Name = request.Name,
        //    FacilityName = request.FacilityName,
        //    FacilityType = request.FacilityType,
        //    ManageMultipleLocations = request.ManageMultipleLocations,
        //    IsActive = true,
        //    OrgAdmin = true // First user logic skipped here
        //};

        //_context.HealthcareUsers.Add(user);

        //var hospital = new Hospital
        //{
        //    Name = request.FacilityName,
        //    Address = request.Address ?? "",
        //    City = request.City ?? "",
        //    State = request.State ?? "",
        //    ZipCode = request.ZipCode ?? "",
        //    Phone = request.Phone,
        //    Email = request.Email,
        //    Type = request.FacilityType,
        //    Latitude = request.Latitude,
        //    Longitude = request.Longitude,
        //    IsActive = true
        //};

        //_context.Hospitals.Add(hospital);

        //var location = new HealthcareLocation
        //{
        //    HealthcareUserId = user.Id,
        //    LocationName = request.FacilityName,
        //    Address = request.Address ?? "",
        //    City = request.City ?? "",
        //    State = request.State ?? "",
        //    ZipCode = request.ZipCode ?? "",
        //    Phone = request.Phone,
        //    FacilityType = request.FacilityType,
        //    IsActive = true,
        //    IsPrimary = true,
        //    Latitude = request.Latitude,
        //    Longitude = request.Longitude
        //};

        //_context.HealthcareLocations.Add(location);

        //await _context.SaveChangesAsync(cancellationToken);

        //return new UserDto
        //{
        //    Id = user.Id,
        //    Email = user.Email,
        //    Name = user.Name,
        //    UserType = "HEALTHCARE",
        //    FacilityName = user.FacilityName,
        //    ManageMultipleLocations = user.ManageMultipleLocations
        //};

        return null;
    }
}
