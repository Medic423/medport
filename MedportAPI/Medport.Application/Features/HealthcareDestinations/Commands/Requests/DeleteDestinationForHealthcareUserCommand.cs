using MediatR;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Requests;

[ExcludeFromCodeCoverage]
public record DeleteDestinationForHealthcareUserCommand(Guid Id, Guid HealthcareUserId) : IRequest;
