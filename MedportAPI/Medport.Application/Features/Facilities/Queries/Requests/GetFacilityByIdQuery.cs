using MediatR;
using System.Diagnostics.CodeAnalysis;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Queries.Handlers;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Requests;

/// <summary>
/// See <see cref="GetFacilityByIdQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage] 
public record GetFacilityByIdQuery(Guid Id) : IRequest<FacilityDto>;
