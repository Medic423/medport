using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.AgencyResponses.Queries.Requests;

/// <summary>
/// See <see cref="GetAllAgencyResponsesQueryHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record GetAllAgencyResponsesQuery(Guid? TransportRequestId = null) : IRequest<List<AgencyResponseDto>>;
