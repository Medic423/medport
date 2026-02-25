using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

public record GetCarriersQuery() : IRequest<IEnumerable<object>>;
