using MediatR;

namespace Medport.Application.Tracc.Features.Optimizations.Queries.Requests;

public record ReturnTripsQuery() : IRequest<object>;
