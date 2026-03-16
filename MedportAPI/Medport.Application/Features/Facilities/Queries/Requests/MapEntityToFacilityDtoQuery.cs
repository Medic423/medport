using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Domain.Entities;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Requests;

public record MapEntityToFacilityDtoQuery(Facility entity) : IRequest<FacilityDto>;
