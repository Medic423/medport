using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetLogsQueryHandler : IRequestHandler<GetLogsQuery, IEnumerable<object>>
{
    public Task<IEnumerable<object>> Handle(GetLogsQuery request, CancellationToken cancellationToken)
    {
        // Placeholder: return empty log list. Integrate with NotificationLogs if available.
        return Task.FromResult<IEnumerable<object>>(new List<object>());
    }
}
