using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetSmsStatsQueryHandler : IRequestHandler<GetSmsStatsQuery, SmsStatsDto>
{
    public Task<SmsStatsDto> Handle(GetSmsStatsQuery request, CancellationToken cancellationToken)
    {
        var dto = new SmsStatsDto
        {
            TotalSent = 0,
            TotalDelivered = 0,
            TotalFailed = 0,
            DeliveryRate = 0,
            CostStats = null
        };
        return Task.FromResult(dto);
    }
}
