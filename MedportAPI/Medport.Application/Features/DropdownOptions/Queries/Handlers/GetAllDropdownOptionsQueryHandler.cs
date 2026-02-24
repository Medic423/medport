using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Medport.Application.Tracc.Features.DropdownOptions.Queries.Handlers;

public class GetAllDropdownOptionsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAllDropdownOptionsQuery, List<DropdownOptionDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<List<DropdownOptionDto>> Handle(GetAllDropdownOptionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.DropdownOptions.AsQueryable();

        if (request.CategoryId.HasValue)
        {
            query = query.Where(o => o.CategoryId == request.CategoryId.Value);
        }

        var list = await query.OrderBy(o => o.DisplayOrder).ToListAsync(cancellationToken);

        return list.Select(o => _mapper.Map<DropdownOptionDto>(o)).ToList();
    }
}
