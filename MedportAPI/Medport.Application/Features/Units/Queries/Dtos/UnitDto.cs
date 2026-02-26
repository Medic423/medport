using System;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Units.Queries.Dtos;

public class UnitDto
{
    public Guid Id { get; set; }
    public Guid AgencyId { get; set; }
    public string UnitNumber { get; set; }
    public string UnitType { get; set; }
    public List<string> Capabilities { get; set; } = new();
    public string CurrentStatus { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastMaintenance { get; set; }
    public DateTime? NextMaintenance { get; set; }
    public DateTime? LastStatusUpdate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
