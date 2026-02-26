using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Units.Queries.Requests;

public record GetAvailableUnitsQuery(Guid AgencyId) : IRequest<List<UnitDto>>;