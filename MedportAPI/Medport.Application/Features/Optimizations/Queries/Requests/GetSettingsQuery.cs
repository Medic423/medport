using MediatR;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Requests;

public record GetSettingsQuery(string AgencyId = null) : IRequest<object>;
