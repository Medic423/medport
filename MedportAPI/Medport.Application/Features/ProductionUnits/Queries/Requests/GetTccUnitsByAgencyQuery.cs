using MediatR;
using Medport.Application.Tracc.Features.ProductionUnits.Queries.Dtos;
using System.Collections.Generic;
using System;

namespace Medport.Application.Tracc.Features.ProductionUnits.Queries.Requests;

public record GetTccUnitsByAgencyQuery(Guid AgencyId) : IRequest<IEnumerable<ProductionUnitDto>>;
