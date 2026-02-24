using MediatR;
using Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Dtos;
using Medport.Common.DTOs;
using System.Diagnostics.CodeAnalysis;
using System;

namespace Medport.Application.Tracc.Features.HealthcareAgencies.Queries.Requests;

[ExcludeFromCodeCoverage]
public class GetAgenciesForHealthcareUserQuery : IRequest<PaginatedList<EmsAgencyDto>>
{
    public Guid HealthcareUserId { get; set; }
    public string Name { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string[] Capabilities { get; set; }
    public bool? IsActive { get; set; }
    public string Status { get; set; } = "all";
    public int Page { get; set; } = 0;
    public int Limit { get; set; } = 50;
}
