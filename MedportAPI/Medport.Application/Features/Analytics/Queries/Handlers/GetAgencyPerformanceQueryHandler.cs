using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetAgencyPerformanceQueryHandler : IRequestHandler<GetAgencyPerformanceQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetAgencyPerformanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetAgencyPerformanceQuery request, CancellationToken cancellationToken)
    {
        //var list = await _context.EmsAgencies.AsNoTracking()
        //    .Select(a => new { a.Id, a.Name, a.IsActive })
        //    .ToListAsync(cancellationToken);

        //return list;

        return null;
    }
}
