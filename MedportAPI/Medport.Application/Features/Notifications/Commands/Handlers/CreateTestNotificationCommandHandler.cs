using MediatR;
using Medport.Application.Tracc.Features.Notifications.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Notifications.Commands.Handlers;

public class CreateTestNotificationCommandHandler : IRequestHandler<CreateTestNotificationCommand, string>
{
    public Task<string> Handle(CreateTestNotificationCommand request, CancellationToken cancellationToken)
    {
        // Placeholder: return a fake id
        return Task.FromResult(System.Guid.NewGuid().ToString());
    }
}
