using MediatR;
using Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.HealthcareSubUsers.Queries.Requests;

public class GetHealthcareSubUsersQuery : IRequest<IEnumerable<HealthcareSubUserDto>>
{
    public string CallerEmail { get; set; }
    public string CallerUserType { get; set; }
}
