using System;

namespace Medport.Application.Tracc.Features.Auth.Queries.Dtos;

public class UserDto
{
    public Guid Id { get; set; }
    public Guid? OrganizationId { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public string UserType { get; set; }
    public string FacilityName { get; set; }
    public string AgencyName { get; set; }
    public Guid? AgencyId { get; set; }
    public bool? ManageMultipleLocations { get; set; }
    public bool? OrgAdmin { get; set; }
}
