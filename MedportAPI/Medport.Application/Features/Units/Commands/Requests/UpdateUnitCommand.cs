using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using System;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Units.Commands.Requests;

public class UpdateUnitCommand : IRequest<UnitDto>
{
    // Unit identifier (string form to be compatible with controller route binding)
    public string UnitId { get; set; }

    public string UnitNumber { get; set; }
    public string UnitType { get; set; }
    public string Description { get; set; }
    public List<string> Capabilities { get; set; } = new();
    public string CurrentStatus { get; set; }
    public bool? IsActive { get; set; }
}
