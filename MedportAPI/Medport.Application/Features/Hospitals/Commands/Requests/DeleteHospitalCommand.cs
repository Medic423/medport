using MediatR;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

/// <summary>
/// See <see cref="DeleteHospitalCommandHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record DeleteHospitalCommand(Guid Id) : IRequest;
