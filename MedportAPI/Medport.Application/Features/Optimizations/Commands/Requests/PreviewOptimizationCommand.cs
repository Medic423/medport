using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Requests;

public class PreviewOptimizationCommand : IRequest<object>
{
    public IEnumerable<string> UnitIds { get; set; }
    public IEnumerable<string> RequestIds { get; set; }
    public object Settings { get; set; }
}
