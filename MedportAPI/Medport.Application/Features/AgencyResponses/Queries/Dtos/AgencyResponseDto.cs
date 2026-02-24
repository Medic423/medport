using System;

namespace Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;

public class AgencyResponseDto
{
    public Guid Id { get; set; }
    public Guid TransportRequestId { get; set; }
    public Guid AgencyId { get; set; }
    public Guid EmsUserId { get; set; }
    public string Response { get; set; } = string.Empty;
    public string ResponseNotes { get; set; } = string.Empty;
    public double? EstimatedEta { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RespondedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
