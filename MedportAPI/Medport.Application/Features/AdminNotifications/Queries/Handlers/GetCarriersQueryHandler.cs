using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetCarriersQueryHandler : IRequestHandler<GetCarriersQuery, IEnumerable<object>>
{
    public Task<IEnumerable<object>> Handle(GetCarriersQuery request, CancellationToken cancellationToken)
    {
        // Placeholder - return empty list or static carriers
        var carriers = new List<object>
        {
            new { id = "twilio", name = "Twilio" },
            new { id = "azure", name = "Azure Communication Services" }
        };
        return Task.FromResult<IEnumerable<object>>(carriers);
    }
}
