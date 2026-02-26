using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Handlers;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;

/// <summary>
/// See <see cref="TestNotificationSystemCommandHandler"/>
/// </summary>
public class TestNotificationSystemCommand : IRequest<TestSystemResultDto>
{
    public Guid UserId { get; set; }
}
