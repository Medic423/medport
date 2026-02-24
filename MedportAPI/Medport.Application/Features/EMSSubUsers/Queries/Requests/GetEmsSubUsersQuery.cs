using MediatR;
using Medport.Application.Tracc.Features.EMSSubUsers.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.EMSSubUsers.Queries.Requests;

public class GetEmsSubUsersQuery : IRequest<IEnumerable<EmsSubUserDto>>
{
    // Caller context
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
