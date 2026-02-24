using MediatR;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Requests;

public class UpdateFacilityCommand : IRequest<FacilityDto>
{
    public Guid Id { get; set; }
    public string LocationName { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string Phone { get; set; }
    public string FacilityType { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
