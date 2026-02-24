using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Commands.Requests;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Handlers;

public class UpsertSettingsCommandHandler : IRequestHandler<UpsertSettingsCommand, object>
{
    public Task<object> Handle(UpsertSettingsCommand request, CancellationToken cancellationToken)
    {
        // Simplified: echo back settings with timestamp
        var settings = new {
            id = $"agency-{request.AgencyId ?? "global"}-{System.DateTime.UtcNow.Ticks}",
            agencyId = request.AgencyId,
            settings = request.Settings,
            updatedAt = System.DateTime.UtcNow
        };

        return Task.FromResult<object>(settings);
    }
}
