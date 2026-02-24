using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Requests;

public record GetSubscriptionPlansQuery(string UserType = "HEALTHCARE") : IRequest<IEnumerable<Medport.Application.Tracc.Features.Public.Queries.Dtos.SubscriptionPlanDto>>;
