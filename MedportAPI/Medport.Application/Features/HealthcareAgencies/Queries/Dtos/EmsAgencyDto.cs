using System;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;

public class EmsAgencyDto
{
    public Guid Id { get; set; }
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
    public bool IsActive { get; set; }
    public string Status { get; set; }
    public Guid? AddedBy { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool AcceptsNotifications { get; set; }
    public bool IsPreferred { get; set; }
}
