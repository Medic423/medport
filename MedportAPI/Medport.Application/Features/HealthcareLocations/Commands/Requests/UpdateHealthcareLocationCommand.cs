using MediatR;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Handlers;
using Medport.Application.Tracc.Features.HealthcareLocations.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;

/// <summary>
/// See <see cref="UpdateHealthcareLocationCommandHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record UpdateHealthcareLocationCommand : IRequest<HealthcareLocationDto>
{
    public Guid Id { get; set; }
    public string LocationName { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string Phone { get; set; }
    public string FacilityType { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPrimary { get; set; }
}
