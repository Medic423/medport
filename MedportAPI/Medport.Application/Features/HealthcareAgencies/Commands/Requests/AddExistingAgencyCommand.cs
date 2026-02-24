using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;

[ExcludeFromCodeCoverage]
public record AddExistingAgencyCommand(Guid HealthcareUserId, Guid AgencyId, bool IsPreferred = false) : IRequest<EmsAgencyDto>;
