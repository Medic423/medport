using MediatR;
using Medport.Application.Tracc.Features.Facilities.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;
using System;

namespace Medport.Application.Tracc.Features.Facilities.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetFacilityByIdQuery(Guid Id) : IRequest<FacilityDto>;
