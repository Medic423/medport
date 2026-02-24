using MediatR;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Commands.Requests;

public class UpdateDestinationForHealthcareUserCommand : IRequest<HealthcareDestinationDto>
{
    public Guid Id { get; set; }
    public Guid HealthcareUserId { get; set; }
    public string DestinationName { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string Phone { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string FacilityType { get; set; }
    public bool IsActive { get; set; }
}
