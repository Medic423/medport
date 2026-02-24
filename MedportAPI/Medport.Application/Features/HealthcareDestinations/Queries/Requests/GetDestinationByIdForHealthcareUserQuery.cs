using MediatR;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetDestinationByIdForHealthcareUserQuery(Guid Id, Guid HealthcareUserId) : IRequest<HealthcareDestinationDto>;
