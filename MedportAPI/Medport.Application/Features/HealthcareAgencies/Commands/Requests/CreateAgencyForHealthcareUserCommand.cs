using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using System;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Commands.Requests;

public class CreateAgencyForHealthcareUserCommand : IRequest<EmsAgencyDto>
{
    public Guid HealthcareUserId { get; set; }
    public string Name { get; set; }
    public string ContactName { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public List<string> ServiceArea { get; set; }
    public List<string> Capabilities { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
