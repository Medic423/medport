using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetAgencyByIdForHealthcareUserQuery(Guid AgencyId, Guid HealthcareUserId) : IRequest<EmsAgencyDto>;
