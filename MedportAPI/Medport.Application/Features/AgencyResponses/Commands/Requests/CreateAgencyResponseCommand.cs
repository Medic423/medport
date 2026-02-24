using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Handlers;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;

/// <summary>
/// See <see cref="CreateAgencyResponseCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record CreateAgencyResponseCommand : IRequest<AgencyResponseDto>
{
    public required Guid TransportRequestId { get; set; }
    public required Guid AgencyId { get; set; }
    public required Guid EmsUserId { get; set; }
    public required string Response { get; set; }
    public string? ResponseNotes { get; set; }
    public double? EstimatedEta { get; set; }
    public string? Status { get; set; }
}
