using MediatR;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Hospitals.Queries.Requests;

/// <summary>
/// See <see cref="GetHospitalByIdQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record GetHospitalByIdQuery(Guid HospitalId) : IRequest<HospitalDto>;

