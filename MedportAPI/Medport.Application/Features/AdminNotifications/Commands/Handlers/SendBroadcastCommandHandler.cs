using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Domain.Entities;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Handlers;

// TODO Fix

public class SendBroadcastCommandHandler(IApplicationDbContext context)
    : IRequestHandler<SendBroadcastCommand, BroadcastResultDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<BroadcastResultDto> Handle(
        SendBroadcastCommand request,
        CancellationToken cancellationToken
    )
    {
        return null;
        //var query = _context.CenterUsers
        //    .AsNoTracking()
        //    .Where(u => u.IsActive);

        //if (request.UserTypes is { Count: > 0 })
        //{
        //    query = query.Where(u => request.UserTypes.Contains(u.UserType));
        //}

        //var users = await query
        //    .Select(u => new ShallowBroadcastUser
        //    {
        //        Id = u.Id,
        //        Email = u.Email,
        //        Name = u.Name,
        //        UserType = u.UserType
        //    })
        //    .ToListAsync(cancellationToken);

        //if (users.Count == 0)
        //{
        //    return ReturnNoUsersResponse();
        //}

        //var finalResult = AddResultsToList(request, users);

        //if (finalResult.Logs.Count != 0)
        //{
        //    await _context.NotificationLogs
        //        .AddRangeAsync(finalResult.Logs, cancellationToken);

        //    await _context.SaveChangesAsync(cancellationToken);
        //}

        //return new BroadcastResultDto
        //{
        //    TotalSent = finalResult.Successful + finalResult.Failed,
        //    Successful = finalResult.Successful,
        //    Failed = finalResult.Failed,
        //    Results = finalResult.Results
        //};
    }

    private static BroadcastFinalResult AddResultsToList(
        SendBroadcastCommand request,
        List<ShallowBroadcastUser> users
    )
    {
        var logs = new List<NotificationLog>();
        var results = new List<ShallowBroadcastResult>();
        var now = DateTime.UtcNow;

        int successful = 0;
        int failed = 0;

        foreach (var user in users)
        {
            var userResults = new List<ShallowBroadcastUserResult>();

            // EMAIL
            if (request.EmailData != null)
            {
                var hasEmail = !string.IsNullOrWhiteSpace(user.Email);

                logs.Add(new NotificationLog
                {
                    UserId = user.Id,
                    NotificationType = request.NotificationType,
                    Channel = "email",
                    Status = hasEmail ? "sent" : "failed",
                    SentAt = now,
                    DeliveredAt = hasEmail ? now : null,
                    ErrorMessage = hasEmail ? string.Empty : "No email address"
                });

                userResults.Add(new ShallowBroadcastUserResult
                {
                    Channel = "email",
                    Success = hasEmail,
                    Error = hasEmail ? string.Empty : "No email address"
                });

                if (hasEmail)
                    successful++;
                else
                    failed++;
            }

            // SMS
            if (request.SmsData != null)
            {
                logs.Add(new NotificationLog
                {
                    UserId = user.Id,
                    NotificationType = request.NotificationType,
                    Channel = "sms",
                    Status = "failed",
                    SentAt = now,
                    ErrorMessage = "No phone number"
                });

                userResults.Add(new ShallowBroadcastUserResult
                {
                    Channel = "sms",
                    Success = false,
                    Error = "No phone number"
                });

                failed++;
            }

            results.Add(new ShallowBroadcastResult
            {
                UserId = user.Id,
                Email = user.Email,
                Name = user.Name,
                UserType = user.UserType,
                Results = userResults
            });
        }

        return new BroadcastFinalResult
        {
            Logs = logs,
            Results = results,
            Successful = successful,
            Failed = failed
        };
    }

    private static BroadcastResultDto ReturnNoUsersResponse()
    {
        var results = new List<ShallowBroadcastResult>();

        var userResults = new List<ShallowBroadcastUserResult>
        {
            new() {
                Channel = string.Empty,
                Success = false,
                Error = "No users found for broadcast"
            }
        };

        results.Add(new ShallowBroadcastResult
        {
            UserId = Guid.Empty,
            Email = string.Empty,
            Name = string.Empty,
            UserType = string.Empty,
            Results = userResults
        });

        return new BroadcastResultDto
        {
            TotalSent = 0,
            Successful = 0,
            Failed = 1,
            Results = results
        };
    }

    private class ShallowBroadcastUser
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? UserType { get; set; }
    }

    private class BroadcastFinalResult
    {
        public List<NotificationLog> Logs { get; set; } = new();
        public List<ShallowBroadcastResult> Results { get; set; } = new();
        public int Successful { get; set; }
        public int Failed { get; set; }
    }
}
