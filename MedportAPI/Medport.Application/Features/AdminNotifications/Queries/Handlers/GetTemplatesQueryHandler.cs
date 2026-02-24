using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

public class GetTemplatesQueryHandler : IRequestHandler<GetTemplatesQuery, TemplatesDto>
{
    public Task<TemplatesDto> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
    {
        var emailTemplates = new Dictionary<string, object>
        {
            { "newTripRequest", new { name = "New Trip Request", description = "Notification sent to EMS agencies for new transport requests", subject = "🚑 New Transport Request - Action Required" } },
            { "tripAccepted", new { name = "Trip Accepted", description = "Notification sent to hospitals when trip is accepted", subject = "✅ Transport Request Accepted" } },
            { "tripStatusUpdate", new { name = "Trip Status Update", description = "Notification sent for trip status changes", subject = "📋 Transport Status Update" } }
        };

        var smsTemplates = new Dictionary<string, object>
        {
            { "newTripRequest", new { name = "New Trip Request SMS", description = "SMS notification for new transport requests", maxLength = 160 } },
            { "tripStatusUpdate", new { name = "Trip Status Update SMS", description = "SMS notification for status updates", maxLength = 160 } }
        };

        var dto = new TemplatesDto
        {
            Email = emailTemplates,
            Sms = smsTemplates
        };

        return Task.FromResult(dto);
    }
}
