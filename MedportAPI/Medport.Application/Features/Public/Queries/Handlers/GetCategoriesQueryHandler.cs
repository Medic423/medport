using MediatR;
using Medport.Application.Tracc.Features.Public.Queries.Requests;
using System.Threading.Tasks;
using System.Threading;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Handlers;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IEnumerable<string>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<string>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var list = await _context.DropdownOptions
            .AsNoTracking()
            .Where(o => o.IsActive)
            .Select(o => o.Category)
            .Distinct()
            .ToListAsync(cancellationToken);

        return list;
    }
}
