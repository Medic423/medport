using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Requests;

public class WhatIfCommand : IRequest<object>
{
    public IEnumerable<string> UnitIds { get; set; }
    public IEnumerable<string> RequestIds { get; set; }
    public object ScenarioSettings { get; set; }
    public object BaseSettings { get; set; }
}
