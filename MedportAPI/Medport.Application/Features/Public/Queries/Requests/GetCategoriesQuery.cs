using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Requests;

public record GetCategoriesQuery() : IRequest<IEnumerable<string>>;
