using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.DropdownOptions.Queries.Requests;

/// <summary>
/// See <see cref="GetDropdownOptionByIdQueryHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record GetDropdownOptionByIdQuery(Guid Id) : IRequest<DropdownOptionDto>;
