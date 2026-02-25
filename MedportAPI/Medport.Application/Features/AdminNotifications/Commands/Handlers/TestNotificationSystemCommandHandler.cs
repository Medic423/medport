using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Handlers;

public class TestNotificationSystemCommandHandler : IRequestHandler<TestNotificationSystemCommand, TestSystemResultDto>
{
    public Task<TestSystemResultDto> Handle(TestNotificationSystemCommand request, CancellationToken cancellationToken)
    {
        // Placeholder: attempt to send test email/sms via integrated services
        var result = new TestSystemResultDto { Email = true, Sms = true, Preferences = null };
        return Task.FromResult(result);
    }
}
