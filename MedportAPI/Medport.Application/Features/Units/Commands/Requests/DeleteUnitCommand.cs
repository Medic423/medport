using MediatR;
using System;

namespace Medport.Application.Tracc.Features.Units.Commands.Requests;

public class DeleteUnitCommand : IRequest<bool>
{
    public string UnitId { get; set; }
}

