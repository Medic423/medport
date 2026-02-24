using MediatR;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;

[ExcludeFromCodeCoverage]
public record TogglePreferredStatusCommand(Guid HealthcareUserId, Guid AgencyId, bool IsPreferred) : IRequest<bool>;
