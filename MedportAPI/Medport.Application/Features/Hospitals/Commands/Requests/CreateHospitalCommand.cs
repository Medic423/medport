using MediatR;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

[ExcludeFromCodeCoverage]
public record CreateHospitalCommand : IRequest<AgencyDto>
{
    public required string Name { get; set; }

    public required string Address { get; set; }
    
    public required string City { get; set; }
    
    public required string State { get; set; }

    public required string ZipCode { get; set; }
    
    public string? Phone { get; set; }
    
    public string? Email { get; set; }
    
    public required string Type { get; set; }
    
    public List<string>? Capabilities { get; set; }
    
    public required string Region { get; set; }
    
    public JsonElement Coordinates { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? OperatingHours { get; set; }

    public required bool IsActive { get; set; } 

    public required bool RequiresReview { get; set; }
}
