using MediatR;
using Medport.Common.DTOs;
using Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.HealthcareDestinations.Queries.Requests;

[ExcludeFromCodeCoverage]
public class GetAllDestinationsForHealthcareUserQuery : IRequest<PaginatedList<HealthcareDestinationDto>>
{
    public Guid HealthcareUserId { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 0;
    public int Limit { get; set; } = 50;
}
