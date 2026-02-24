using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Requests;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System.Collections.Generic;
using Medport.Domain.Entities;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Handlers;

public class GetHealthcareSubUsersQueryHandler : IRequestHandler<GetHealthcareSubUsersQuery, IEnumerable<HealthcareSubUserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHealthcareSubUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HealthcareSubUserDto>> Handle(GetHealthcareSubUsersQuery request, CancellationToken cancellationToken)
    {
        if (request.CallerUserType != "HEALTHCARE" && request.CallerUserType != "ADMIN")
            throw new UnauthorizedAccessException("Forbidden");

        var query = _context.HealthcareUsers.AsQueryable().Where(u => u.IsSubUser);

        if (request.CallerUserType == "HEALTHCARE")
        {
            var parent = await _context.HealthcareUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
            if (parent == null) throw new UnauthorizedAccessException("Parent healthcare user not found");
            query = query.Where(u => u.ParentUserId == parent.Id);
        }

        var list = await query.OrderByDescending(u => u.CreatedAt).Select(u => new HealthcareSubUserDto
        {
            Id = u.Id,
            Email = u.Email,
            Name = u.Name,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        }).ToListAsync(cancellationToken);

        return list;
    }
}
