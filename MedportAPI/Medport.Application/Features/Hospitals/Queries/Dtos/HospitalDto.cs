using System.Text.Json;

namespace Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;

public class HospitalDto
{
    public string Type { get; set; } = string.Empty;

    public string Id { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public string Address { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string ZipCode { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public List<string> Capabilities { get; set; } = new();

    // Equivalent to Prisma JsonValue
    public JsonElement Coordinates { get; set; }

    public string Region { get; set; } = string.Empty;

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? OperatingHours { get; set; }

    public bool RequiresReview { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? ApprovedBy { get; set; }
}
