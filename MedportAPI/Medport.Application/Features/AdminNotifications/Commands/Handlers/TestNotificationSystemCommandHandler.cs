using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Handlers;

public class TestNotificationSystemCommandHandler(IApplicationDbContext context) : IRequestHandler<TestNotificationSystemCommand, TestSystemResultDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<TestSystemResultDto> Handle(TestNotificationSystemCommand request, CancellationToken cancellationToken)
    {
        return null;
        //try
        //{
        //    // Basic connectivity checks based on environment variables for configured services
        //    var emailConnected = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("SENDGRID_API_KEY"))
        //        || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("EMAIL_SERVICE_CONNECTION"));

        //    var smsConnected = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("AZURE_COMMUNICATION_CONNECTION_STRING"))
        //        || (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID")) && !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN")));

        //    // Try to resolve basic user preferences from CenterUsers table (fallback defaults if not modeled)
        //    var user = await _context.CenterUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        //    var preferences = new
        //    {
        //        emailNotifications = true,
        //        smsNotifications = false,
        //        newTripAlerts = true,
        //        statusUpdates = true,
        //        emailAddress = user?.Email,
        //        phoneNumber = (string?)null
        //    } as object;

        //    return new TestSystemResultDto
        //    {
        //        Email = emailConnected,
        //        Sms = smsConnected,
        //        Preferences = preferences
        //    };
        //}
        //catch (Exception ex)
        //{
        //    Console.WriteLine($"TCC_DEBUG: Error testing notification system: {ex}");
        //    return new TestSystemResultDto
        //    {
        //        Email = false,
        //        Sms = false,
        //        Preferences = null
        //    };
        //}
    }
}
