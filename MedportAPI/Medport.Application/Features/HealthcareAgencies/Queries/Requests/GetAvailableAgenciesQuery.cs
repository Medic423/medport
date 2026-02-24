using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetAvailableAgenciesQuery(Guid HealthcareUserId, double? RadiusMiles = null) : IRequest<IEnumerable<EmsAgencyDto>>;
