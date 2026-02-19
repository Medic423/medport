using MediatR;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

[ExcludeFromCodeCoverage]
public record DeleteHospitalCommand(string Id) : IRequest;
