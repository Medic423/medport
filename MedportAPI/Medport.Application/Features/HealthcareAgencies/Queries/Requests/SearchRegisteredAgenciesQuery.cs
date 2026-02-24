using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;

[ExcludeFromCodeCoverage]
public record SearchRegisteredAgenciesQuery(string Query) : IRequest<System.Collections.Generic.IEnumerable<EmsAgencyDto>>;
