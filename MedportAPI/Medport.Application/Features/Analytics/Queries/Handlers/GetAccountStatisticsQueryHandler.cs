using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using System.Threading.Tasks;
using System.Threading;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetAccountStatisticsQueryHandler : IRequestHandler<GetAccountStatisticsQuery, object>
{
    private readonly IApplicationDbContext _context;

    public GetAccountStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> Handle(GetAccountStatisticsQuery request, CancellationToken cancellationToken)
    {
        var totalHealthcare = await _context.HealthcareUsers.CountAsync(cancellationToken);
        var totalEms = await _context.EmsAgencies.CountAsync(cancellationToken);
        var totalCenter = await _context.CenterUsers.CountAsync(cancellationToken);

        return new { totalHealthcare, totalEms, totalCenter };
    }
}
