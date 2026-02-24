using MediatR;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;

public class ResetEmsSubUserPasswordCommand : IRequest<ResetEmsSubUserResultDto>
{
    public Guid Id { get; set; }

    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
