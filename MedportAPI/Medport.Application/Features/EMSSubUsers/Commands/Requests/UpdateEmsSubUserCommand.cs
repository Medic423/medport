using MediatR;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Commands.Requests;

public class UpdateEmsSubUserCommand : IRequest<EmsSubUserDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public bool? IsActive { get; set; }

    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
