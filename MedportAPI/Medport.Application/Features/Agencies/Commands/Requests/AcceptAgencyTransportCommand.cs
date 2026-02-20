using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.Agencies.Commands.Requests
{
    public class AcceptAgencyTransportCommand : IRequest
    {
        public Guid TripId { get; set; }
        public Guid AgencyId { get; set; }
        public string Response { get; set; }
        public string ResponseNotes { get; set; }
        public DateTime EstimatedArrival { get; set; }
        public DateTime ResponseTimestamp { get; set; }
        public bool IsSelected { get; set; }
    }
}
