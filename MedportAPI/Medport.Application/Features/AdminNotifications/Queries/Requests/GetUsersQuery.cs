using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

public class GetUsersQuery : IRequest<List<NotificationUserDto>>
{
    public string UserType { get; set; }
    public int Limit { get; set; } = 100;

    public GetUsersQuery() { }
    public GetUsersQuery(string userType, int limit = 100) { UserType = userType; Limit = limit; }
}
