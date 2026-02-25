using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IEnumerable<NotificationUserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NotificationUserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CenterUsers.AsNoTracking().Where(u => u.IsActive);
        if (!string.IsNullOrWhiteSpace(request.UserType)) query = query.Where(u => u.UserType == request.UserType);

        var users = await query.OrderByDescending(u => u.CreatedAt).Take(request.Limit).ToListAsync(cancellationToken);

        return users.Select(u => new NotificationUserDto
        {
            Id = u.Id,
            Email = u.Email,
            Name = u.Name,
            UserType = u.UserType,
            Phone = u.Phone,
            EmailNotifications = u.EmailNotifications,
            SmsNotifications = u.SmsNotifications,
            CreatedAt = u.CreatedAt
        }).ToList();
    }
}
