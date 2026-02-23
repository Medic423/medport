using MediatR;
using Medport.Application.Tracc.Features.Agencies.Constants;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.Agencies.Commands.Requests;

/// <summary>
/// See <see cref="RejectAgencyTransportCommandHandler"/>
/// </summary>
public class RejectAgencyTransportCommand: IRequest<AgencyDto>
{
    public Guid TripId { get; set; }
    public Guid AgencyId { get; set; }
    public string Response { get; set; } = AgencyConstants.GenericMessages.Declined;
    public string ResponseNotes { get; set; } = AgencyConstants.GenericMessages.RejectNoReasonProvided;
    public DateTime EstimatedArrival { get; set; }
    public DateTime ResponseTimestamp { get; set; }
    public bool IsSelected { get; set; }
}
