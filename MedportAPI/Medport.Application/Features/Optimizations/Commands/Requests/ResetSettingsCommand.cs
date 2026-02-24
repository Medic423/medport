using MediatR;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Requests;

public record ResetSettingsCommand(string AgencyId = null) : IRequest<object>;
