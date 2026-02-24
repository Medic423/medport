using MediatR;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Dtos;
using Medport.Application.Tracc.Features.DropdownCategories.Queries.Handlers;

namespace Medport.Application.Tracc.Features.DropdownCategories.Queries.Requests;

/// <summary>
/// See <see cref="GetDropdownCategoryByIdQueryHandler"/>
/// </summary>
public record GetDropdownCategoryByIdQuery(Guid Id) : IRequest<DropdownCategoryDto>;
