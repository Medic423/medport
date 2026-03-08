using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Queries.Requests;

public record GetHealthcareLocationStatisticsQuery(Guid HealthcareUserId) : IRequest<List<HealthcareLocationStatisticsDto>>;
