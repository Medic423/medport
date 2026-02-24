using MediatR;
using Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Requests;

[ExcludeFromCodeCoverage]
public record GetTemplatesQuery() : IRequest<TemplatesDto>;
