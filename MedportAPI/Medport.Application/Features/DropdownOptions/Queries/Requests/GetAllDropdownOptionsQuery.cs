using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Handlers;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Tracc.Features.DropdownOptions.Queries.Requests;

/// <summary>
/// See <see cref="GetAllDropdownOptionsQueryHandler"/>
/// </summary>
[ExcludeFromCodeCoverage]
public record GetAllDropdownOptionsQuery(Guid? CategoryId = null) : IRequest<List<DropdownOptionDto>>;
