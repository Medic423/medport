using MediatR;
using System.Collections.Generic;
using System;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

public record GetLogsQuery(int Days = 30, int Limit = 100, Guid? UserId = null, string Channel = null, string Status = null) : IRequest<IEnumerable<object>>;
