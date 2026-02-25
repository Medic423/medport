using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetHospitalActivityQueryHandler : IRequestHandler<GetHospitalActivityQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetHospitalActivityQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetHospitalActivityQuery request, CancellationToken cancellationToken)
    {
        var list = await _context.Hospitals.AsNoTracking()
            .Select(h => new { h.Id, h.Name, h.IsActive })
            .ToListAsync(cancellationToken);

        return list;
    }
}
