using MediatR;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetIdleAccountsQuery(int Days) : IRequest<object>;
