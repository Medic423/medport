using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetLogsQueryHandler(IApplicationDbContext context) : IRequestHandler<GetLogsQuery, List<NotificationLogDto>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<List<NotificationLogDto>> Handle(GetLogsQuery request, CancellationToken cancellationToken)
    {
        var since = DateTime.UtcNow.AddDays(-request.Days);

        var query = _context.NotificationLogs.AsNoTracking().AsQueryable();

        query = query.Where(x => x.SentAt >= since);

        query = ParameterQuery(request,query);

        var logs = await query
            .Include(x => x.User)
            .OrderByDescending(x => x.SentAt)
            .Take(request.Limit)
            .ToListAsync(cancellationToken);

        var result = logs.Select(l => new NotificationLogDto
        {
            Id = l.Id.ToString(),
            UserId = l.UserId.ToString(),
            NotificationType = l.NotificationType,
            Channel = l.Channel,
            Status = l.Status,
            SentAt = l.SentAt,
            DeliveredAt = l.DeliveredAt ?? default,
            ErrorMessage = l.ErrorMessage,
            User = l.User == null ? null : new NotificationUserDto
            {
                Id = l.User.Id,
                Email = l.User.Email,
                Name = l.User.Name,
                UserType = l.User.UserType
            }
        }).ToList();

        return result;
    }

    private static IQueryable<NotificationLog> ParameterQuery(GetLogsQuery request, IQueryable<NotificationLog> query)
    {
        if (request.UserId.HasValue)
            query = query.Where(x => x.UserId == request.UserId.Value);

        if (!string.IsNullOrWhiteSpace(request.Channel))
            query = query.Where(x => x.Channel == request.Channel);

        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(x => x.Status == request.Status);

        return query;
    }
}
