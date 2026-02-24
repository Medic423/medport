using MediatR;
using Medport.Application.Tracc.Features.Optimizations.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Requests;

public class OptimizeRoutesCommand : IRequest<OptimizationResultDto>
{
    public string UnitId { get; set; }
    public IEnumerable<string> RequestIds { get; set; }
    public object Constraints { get; set; }
}
