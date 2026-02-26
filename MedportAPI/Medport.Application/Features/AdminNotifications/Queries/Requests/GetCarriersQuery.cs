using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Handlers;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

/// <summary>
/// See <see cref="GetCarriersQueryHandler"/>
/// </summary>
public record GetCarriersQuery() : IRequest<IEnumerable<object>>;
