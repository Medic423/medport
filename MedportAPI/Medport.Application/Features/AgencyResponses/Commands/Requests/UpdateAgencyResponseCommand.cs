using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Handlers;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;

/// <summary>
/// See <see cref="UpdateAgencyResponseCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record UpdateAgencyResponseCommand : IRequest<AgencyResponseDto>
{
    public required Guid Id { get; set; }
    public Guid? TransportRequestId { get; set; }
    public Guid? AgencyId { get; set; }
    public Guid? EmsUserId { get; set; }
    public string? Response { get; set; }
    public string? ResponseNotes { get; set; }
    public double? EstimatedEta { get; set; }
    public string? Status { get; set; }
}
