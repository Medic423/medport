using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

[ExcludeFromCodeCoverage]
public record RejectHospitalCommand : IRequest<HospitalDto>
{
    public required string Id { get; set; }
    public required string ApprovedBy { get; set; }

    public bool IsActive { get; set; } = false;
    public bool RequiresReview { get; set; } = false;
    public DateTime ApprovedAt { get; set; } = DateTime.UtcNow;
}

