using MediatR;
using Medport.Application.Tracc.Features.Notifications.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Handlers;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, int>
{
    public Task<int> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        // Placeholder: return 0 marked
        return Task.FromResult(0);
    }
}
