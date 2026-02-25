using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Requests;

public record GetRecentRegistrationsQuery(string Type, int Days) : IRequest<IEnumerable<object>>;
