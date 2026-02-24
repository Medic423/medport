using System;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.ProductionUnits.Queries.Dtos;

public class ProductionUnitDto
{
    public Guid Id { get; set; }
    public Guid AgencyId { get; set; }
    public string UnitNumber { get; set; }
    public string Type { get; set; }
    public IEnumerable<string> Capabilities { get; set; }
    public string CurrentStatus { get; set; }
    public string CurrentLocation { get; set; }
    public int CrewSize { get; set; }
    public IEnumerable<string> Equipment { get; set; }
    public DateTime? ShiftStart { get; set; }
    public DateTime? ShiftEnd { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
