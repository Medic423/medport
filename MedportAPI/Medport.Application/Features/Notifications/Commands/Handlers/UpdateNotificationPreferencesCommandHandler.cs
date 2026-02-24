using MediatR;
using Medport.Application.Tracc.Features.Notifications.Commands.Requests;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Handlers;

public class UpdateNotificationPreferencesCommandHandler : IRequestHandler<UpdateNotificationPreferencesCommand, NotificationPreferencesDto>
{
    public Task<NotificationPreferencesDto> Handle(UpdateNotificationPreferencesCommand request, CancellationToken cancellationToken)
    {
        // Placeholder: no-op
        return Task.FromResult(request.Preferences);
    }
}
