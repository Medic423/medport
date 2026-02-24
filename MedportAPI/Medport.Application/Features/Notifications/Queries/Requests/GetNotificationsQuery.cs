using MediatR;
using Medport.Application.Tracc.Features.Notifications.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Notifications.Queries.Requests;

public record GetNotificationsQuery() : IRequest<IEnumerable<NotificationDto>>;
