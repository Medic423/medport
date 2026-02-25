using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Requests;

public record GetNotificationLogQuery(string UserId, int Days = 30, int Limit = 50) : IRequest<IEnumerable<object>>;
