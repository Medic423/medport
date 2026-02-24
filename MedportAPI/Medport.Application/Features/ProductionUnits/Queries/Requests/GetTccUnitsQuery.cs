using MediatR;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.ProductionUnits.Queries.Requests;

public record GetTccUnitsQuery() : IRequest<IEnumerable<ProductionUnitDto>>;
