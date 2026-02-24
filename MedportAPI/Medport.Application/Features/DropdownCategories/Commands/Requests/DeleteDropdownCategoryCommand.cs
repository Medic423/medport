using MediatR;
using Medport.Application.Tracc.Features.DropdownCategories.Commands.Handlers;
using System;

namespace Medport.Application.Tracc.Features.DropdownCategories.Commands.Requests;

/// <summary>
/// See <see cref="DeleteDropdownCategoryCommandHandler"/>
/// </summary>
public record DeleteDropdownCategoryCommand(Guid Id) : IRequest;
