using MediatR;
using Medport.Application.Tracc.Features.Trips.Queries.Dtos;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Trips.Queries.Requests;

public class GetTripsQuery : IRequest<IEnumerable<TransportRequestDto>>
{
    public string Status { get; set; }
    public string TransportLevel { get; set; }
    public string Priority { get; set; }
    public string AgencyId { get; set; }
    public string HealthcareUserId { get; set; }
}
