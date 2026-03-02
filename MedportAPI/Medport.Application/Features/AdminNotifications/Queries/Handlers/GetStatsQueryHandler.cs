using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Constants;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;
public class GetStatsQueryHandler : IRequestHandler<GetStatsQuery, MessageStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetStatsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<MessageStatsDto> Handle(GetStatsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var since = DateTime.UtcNow.AddDays(-request.days);

            var logs = await _context.NotificationLogs
                .Where(x => x.SentAt >= since)
                .Include(x => x.User)
                .ToListAsync(cancellationToken);

            var stats = new MessageStatsDto
            {
                TotalSent = logs.Count,
                TotalDelivered = logs.Count(x => x.Status == AdminNotificationConstants.SentStatus),
                TotalFailed = logs.Count(x => x.Status == AdminNotificationConstants.FailedStatus),
                DeliveryRate = 0,
                ByChannel = new ChannelStatsDto
                {
                    Email = new MessageCountDto(),
                    Sms = new MessageCountDto()
                },
                ByUser = new Dictionary<string, MessageCountDto>(),
                ByType = new Dictionary<string, MessageCountDto>()
            };

            foreach (var log in logs)
            {
                // Channel stats
                if (log.Channel == AdminNotificationConstants.Email)
                {
                    stats.ByChannel.Email.Sent++;
                    if (log.Status == AdminNotificationConstants.SentStatus) stats.ByChannel.Email.Delivered++;
                    if (log.Status == AdminNotificationConstants.FailedStatus) stats.ByChannel.Email.Failed++;
                }
                else if (log.Channel == AdminNotificationConstants.SMS)
                {
                    stats.ByChannel.Sms.Sent++;
                    if (log.Status == AdminNotificationConstants.SentStatus) stats.ByChannel.Sms.Delivered++;
                    if (log.Status == AdminNotificationConstants.FailedStatus) stats.ByChannel.Sms.Failed++;
                }

                // User stats
                var userKey = log.UserId.ToString();
                if (!stats.ByUser.ContainsKey(userKey))
                {
                    stats.ByUser[userKey] = new MessageCountDto();
                }

                stats.ByUser[userKey].Sent++;
                if (log.Status == AdminNotificationConstants.SentStatus)
                {
                    stats.ByUser[userKey].Delivered++;
                }
                if (log.Status == AdminNotificationConstants.FailedStatus)
                {
                    stats.ByUser[userKey].Failed++;
                }

                // Type stats
                var typeKey = log.NotificationType ?? string.Empty;
                if (!stats.ByType.ContainsKey(typeKey))
                {
                    stats.ByType[typeKey] = new MessageCountDto();
                }

                stats.ByType[typeKey].Sent++;
                if (log.Status == AdminNotificationConstants.SentStatus) stats.ByType[typeKey].Delivered++;
                if (log.Status == AdminNotificationConstants.FailedStatus) stats.ByType[typeKey].Failed++;
            }

            stats.DeliveryRate = stats.TotalSent > 0
                ? ((double)stats.TotalDelivered / stats.TotalSent) * 100
                : 0;

            return stats;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TCC_DEBUG: Error getting all notification stats: {ex}");

            return new MessageStatsDto
            {
                TotalSent = 0,
                TotalDelivered = 0,
                TotalFailed = 0,
                DeliveryRate = 0,
                ByChannel = new ChannelStatsDto
                {
                    Email = new MessageCountDto(),
                    Sms = new MessageCountDto()
                },
                ByUser = new Dictionary<string, MessageCountDto>(),
                ByType = new Dictionary<string, MessageCountDto>()
            };
        }
    }
}