using Medport.Domain.Common;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Medport.Domain.Entities;

[Table("Hospitals")]
public class Hospital : BaseAuditableDto
{
    // Primary
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public string Id { get; set; }


    [Column("name")]
    public string Name { get; set; }

    [Column("address")]
    public string Address { get; set; }

    [Column("city")]
    public string City { get; set; }

    [Column("state")]
    public string State { get; set; }

    [Column("zipCode")]
    public string ZipCode { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("type")]
    public string Type { get; set; }

    [Column("capabilities")]
    public string[]? Capabilities { get; set; }

    [Column("region")]
    public string Region { get; set; }

    [Column("coordinates")]
    public JsonElement? Coordinates { get; set; }

    [Column("latitude")]
    public double? Latitude { get; set; }

    [Column("longitude")]
    public double? Longitude { get; set; }

    [Column("operatingHours")]
    public string? OperatingHours { get; set; }

    [Column("isActive")]
    public bool IsActive { get; set; }

    [Column("requiresReview")]
    public bool RequiresReview { get; set; }

    [Column("approvedAt")]
    public DateTime? ApprovedAt { get; set; }

    [Column("approvedBy")]
    public string? ApprovedBy { get; set; }
}
