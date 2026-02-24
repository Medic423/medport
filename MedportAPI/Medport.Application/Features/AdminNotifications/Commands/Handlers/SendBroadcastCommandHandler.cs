using MediatR;
using Medport.Domain.Interfaces;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Handlers;

public class SendBroadcastCommandHandler : IRequestHandler<SendBroadcastCommand, BroadcastResultDto>
{
    private readonly IApplicationDbContext _context;

    public SendBroadcastCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BroadcastResultDto> Handle(SendBroadcastCommand request, CancellationToken cancellationToken)
    {
        // Find users
        var query = _context.CenterUsers.AsQueryable().Where(u => u.IsActive);

        if (request.UserTypes != null && request.UserTypes.Any())
        {
            query = query.Where(u => request.UserTypes.Contains(u.UserType));
        }

        var users = await query.Select(u => new { u.Id, u.Email }).ToListAsync(cancellationToken);

        // In this simplified implementation we do not actually send notifications; we return counts
        var result = new BroadcastResultDto
        {
            TotalSent = users.Count,
            Successful = users.Count, // assume success
            Failed = 0,
            Results = new List<object>()
        };

        return result;
    }
}
