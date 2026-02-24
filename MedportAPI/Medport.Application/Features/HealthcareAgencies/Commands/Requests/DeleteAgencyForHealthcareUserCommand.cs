using MediatR;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;

[ExcludeFromCodeCoverage]
public record DeleteAgencyForHealthcareUserCommand(Guid Id, Guid HealthcareUserId) : IRequest;
