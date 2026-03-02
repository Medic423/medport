using MediatR;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Agencies.Queries.Requests;

/// <summary>
/// See <see cref="GetAgencyTransportQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record GetAgencyTransportQuery(Guid AgencyId, bool IsDemo): IRequest<List<TransportRequestDto>>;
