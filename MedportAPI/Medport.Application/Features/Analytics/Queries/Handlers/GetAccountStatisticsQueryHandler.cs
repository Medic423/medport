using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetAccountStatisticsQueryHandler(IApplicationDbContext context) : IRequestHandler<GetAccountStatisticsQuery, AnalyticsDto>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<AnalyticsDto> Handle(GetAccountStatisticsQuery request, CancellationToken cancellationToken)
    {
        var totalHealthcare = await _context.HealthcareUsers.CountAsync(cancellationToken);
        var totalEms = await _context.EmsAgencies.CountAsync(cancellationToken);
        var totalCenter = await _context.CenterUsers.CountAsync(cancellationToken);

        return new AnalyticsDto
        {
            TotalHospitals = totalHealthcare,
            TotalEmsAgencies = totalEms,
            TotalCenterUsers = totalCenter,
            TotalDropdownCategories = totalHealthcare + totalEms + totalCenter
        };
    }
}
