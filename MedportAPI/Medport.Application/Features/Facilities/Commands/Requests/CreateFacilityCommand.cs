using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Commands.Handlers;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Requests;

/// <summary>
/// See <see cref="CreateFacilityCommandHandler"/>
/// </summary>

public class CreateFacilityCommand : IRequest<FacilityDto>
{
    public Guid OrganizationId { get; set; }
    public required string FacilityType { get; set; }
    public required string Name { get; set; }
    public required string Address { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string ZipCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? ContactName { get; set; }
    public required List<string> Capabilities { get; set; }
    public string? Region { get; set; }
    public string? Coordinates { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? OperatingHours { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; } = true;
    public bool RequiresReview { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public string? Notes { get; set; }
}
