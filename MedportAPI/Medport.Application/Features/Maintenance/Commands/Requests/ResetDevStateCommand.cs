using MediatR;
using Medport.Application.Tracc.Features.Maintenance.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Maintenance.Commands.Requests;

public record ResetDevStateCommand() : IRequest<ResetDevStateResultDto>;
