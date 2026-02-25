using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Constants;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;
public class GetStatsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetStatsQuery, MessageStatsDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<MessageStatsDto> Handle(GetStatsQuery request, CancellationToken cancellationToken)
    {
        // Check if admin 
        // May want to add middleware to controller route for this and not do in here
        try
        {
            var since = DateTime.UtcNow.AddDays(-request.days);

            var logs = await _context.NotificationLogs
                .Where(x => x.SentAt >= since)
                .Include(x => x.User)
                .ToListAsync();

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
                if (!stats.ByUser.ContainsKey(log.UserId))
                {
                    stats.ByUser[log.UserId] = new MessageCountDto();
                }

                stats.ByUser[log.UserId].Sent++;
                if (log.Status == AdminNotificationConstants.SentStatus)
                {
                    stats.ByUser[log.UserId].Delivered++;
                }
                if (log.Status == AdminNotificationConstants.FailedStatus)
                {
                    stats.ByUser[log.UserId].Failed++;
                }

                // Type stats
                if (!stats.ByType.ContainsKey(log.NotificationType))
                {
                    stats.ByType[log.NotificationType] = new MessageCountDto();
                }

                stats.ByType[log.NotificationType].Sent++;
                if (log.Status == AdminNotificationConstants.SentStatus) stats.ByType[log.NotificationType].Delivered++;
                if (log.Status == AdminNotificationConstants.FailedStatus) stats.ByType[log.NotificationType].Failed++;
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
                ByUser = [],
                ByType = []
            };
        }
    }
}