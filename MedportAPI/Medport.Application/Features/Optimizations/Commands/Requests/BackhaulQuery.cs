using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Requests;

public class BackhaulQuery : IRequest<object>
{
    public IEnumerable<string> RequestIds { get; set; }
}
