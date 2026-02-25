using MediatR;
using Medport.Application.Tracc.Features.Auth.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Auth.Commands.Requests;

public class CreateHealthcareCommand : IRequest<UserDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
    public string FacilityName { get; set; }
    public string FacilityType { get; set; }
    public bool ManageMultipleLocations { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string Phone { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
