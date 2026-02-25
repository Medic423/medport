using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;

public class TestNotificationSystemCommand : IRequest<TestSystemResultDto>
{
    public Guid UserId { get; set; }
}
