using MediatR;
using Medport.Application.Tracc.Features.Agencies.Constants;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.Agencies.Commands.Requests;

/// <summary>
/// See <see cref="AcceptAgencyTransportCommandHandler"/>
/// </summary>
public class AcceptAgencyTransportCommand : IRequest<AgencyDto>
{
    public Guid TripId { get; set; }
    public Guid AgencyId { get; set; }
    public string Response { get; set; } = AgencyConstants.GenericMessages.Accept;
    public string ResponseNotes { get; set; } = AgencyConstants.GenericMessages.AcceptedViaEndpoint;
    public DateTime EstimatedArrival { get; set; }
    public DateTime ResponseTimestamp { get; set; }
    public bool IsSelected { get; set; }
}
