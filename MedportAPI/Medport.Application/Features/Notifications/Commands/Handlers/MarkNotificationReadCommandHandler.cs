using MediatR;
using Medport.Application.Tracc.Features.Notifications.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Handlers;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, bool>
{
    public Task<bool> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        // Placeholder: no-op. If SystemAnalytics exists update metricValue.read
        return Task.FromResult(true);
    }
}
