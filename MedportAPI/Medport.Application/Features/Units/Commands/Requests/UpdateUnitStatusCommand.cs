using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;
using System;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Units.Commands.Requests;

public class UpdateUnitStatusCommand : IRequest<UnitDto>
{
    public string UnitId { get; set; }
    public string Status { get; set; }
    public string Location { get; set; }
    public List<string> Crew { get; set; } = new();
}

