using Dapper;
using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Medport.Domain.Interfaces;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetLogsQueryHandler(IDapperConnectionFactory dapperConnectionFactory) : IRequestHandler<GetLogsQuery, List<NotificationLogDto>>
{
    private readonly IDapperConnectionFactory _dapperConnectionFactory = dapperConnectionFactory;

    public async Task<List<NotificationLogDto>> Handle(GetLogsQuery request, CancellationToken cancellationToken)
    {
        using var connection = _dapperConnectionFactory.CreateConnection();

        var since = DateTime.UtcNow.AddDays(-request.Days);

        var logs = await connection.QueryAsync<
                NotificationLogDto,
                NotificationUserDto,
                NotificationLogDto
            >(
            GetSql(),
            (log, user) =>
            {
                log.User = user;
                return log;
            },
            new
            {
                Since = since,
                request.Limit,
                request.UserId,
                request.Channel,
                request.Status
            },
            splitOn: "UserIdSplit"
        );

        return [.. logs];
    }

    private static string GetSql()
    {
        return @"
            SELECT TOP (@Limit)
                nl.Id,
                nl.UserId,
                nl.NotificationType,
                nl.Channel,
                nl.Status,
                nl.SentAt,
                nl.DeliveredAt,
                nl.ErrorMessage,
                u.Id AS UserIdSplit,
                u.Email,
                u.Name,
                u.UserType
            FROM NotificationLogs nl
            LEFT JOIN Users u ON nl.UserId = u.Id
            WHERE nl.SentAt >= @Since
              AND (@UserId IS NULL OR nl.UserId = @UserId)
              AND (@Channel IS NULL OR nl.Channel = @Channel)
              AND (@Status IS NULL OR nl.Status = @Status)
            ORDER BY nl.SentAt DESC
        ";
    }
}
