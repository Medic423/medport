using MediatR;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetActiveUsersQuery(int ThresholdMinutes = 15, string ExcludeUserId = null) : IRequest<object>;
