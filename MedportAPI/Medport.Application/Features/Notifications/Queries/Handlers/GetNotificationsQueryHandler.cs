using MediatR;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;
using Medport.Application.Tracc.Features.Notifications.Queries.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Handlers;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, IEnumerable<NotificationDto>>
{
    public Task<IEnumerable<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        // Placeholder implementation: return empty list. Replace with DB logic if SystemAnalytics entity exists.
        IEnumerable<NotificationDto> list = new List<NotificationDto>();
        return Task.FromResult(list);
    }
}
