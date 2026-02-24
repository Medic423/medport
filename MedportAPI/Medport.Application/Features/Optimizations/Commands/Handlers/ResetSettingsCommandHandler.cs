using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Handlers;

public class ResetSettingsCommandHandler : IRequestHandler<ResetSettingsCommand, object>
{
    public Task<object> Handle(ResetSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = new {
            id = $"default-{request.AgencyId ?? "global"}-{System.DateTime.UtcNow.Ticks}",
            agencyId = request.AgencyId,
            updatedAt = System.DateTime.UtcNow
        };

        return Task.FromResult<object>(settings);
    }
}
