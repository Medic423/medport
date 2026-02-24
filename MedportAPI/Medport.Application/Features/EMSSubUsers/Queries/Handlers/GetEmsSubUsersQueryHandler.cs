using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Requests;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Queries.Handlers;

public class GetEmsSubUsersQueryHandler : IRequestHandler<GetEmsSubUsersQuery, IEnumerable<EmsSubUserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEmsSubUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EmsSubUserDto>> Handle(GetEmsSubUsersQuery request, CancellationToken cancellationToken)
    {
        if (request.CallerUserType != "EMS" && request.CallerUserType != "ADMIN")
            throw new UnauthorizedAccessException("Forbidden");

        var query = _context.EmsUsers.AsQueryable().Where(u => u.IsSubUser);

        if (request.CallerUserType == "EMS")
        {
            var parent = await _context.EmsUsers.FirstOrDefaultAsync(u => u.Email == request.CallerEmail && !u.IsSubUser, cancellationToken);
            if (parent == null) throw new UnauthorizedAccessException("Parent EMS user not found");
            query = query.Where(u => u.ParentUserId == parent.Id);
        }

        var list = await query.OrderByDescending(u => u.CreatedAt).Select(u => new EmsSubUserDto
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
