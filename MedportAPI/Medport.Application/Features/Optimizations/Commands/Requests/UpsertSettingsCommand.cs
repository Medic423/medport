using MediatR;

namespace Medport.Application.Tracc.Features.Optimizations.Commands.Requests;

public class UpsertSettingsCommand : IRequest<object>
{
    public string AgencyId { get; set; }
    public object Settings { get; set; }
}
