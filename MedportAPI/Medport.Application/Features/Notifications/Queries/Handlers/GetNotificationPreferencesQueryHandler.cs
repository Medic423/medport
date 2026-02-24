using MediatR;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;
using Medport.Application.Tracc.Features.Notifications.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Handlers;

public class GetNotificationPreferencesQueryHandler : IRequestHandler<GetNotificationPreferencesQuery, NotificationPreferencesDto>
{
    public Task<NotificationPreferencesDto> Handle(GetNotificationPreferencesQuery request, CancellationToken cancellationToken)
    {
        // Placeholder: return default preferences. Integrate with user settings table if available.
        var dto = new NotificationPreferencesDto
        {
            EmailEnabled = true,
            SmsEnabled = false,
            Phone = string.Empty
        };

        return Task.FromResult(dto);
    }
}
