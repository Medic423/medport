using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.Analytics.Queries.Requests;
using Medport.Application.Tracc.Features.Analytics.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Medport.Application.Tracc.Features.Analytics.Queries.Handlers;

public class GetAnalyticsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAnalyticsQuery, AnalyticsDto>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<AnalyticsDto> Handle(GetAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var totalHospitals = await _context.Hospitals.CountAsync(cancellationToken);
        var activeHospitals = await _context.Hospitals.CountAsync(h => h.IsActive, cancellationToken);
        var totalDropdownCategories = await _context.DropdownCategories.CountAsync(cancellationToken);
        var activeDropdownOptions = await _context.DropdownOptions.CountAsync(o => o.IsActive, cancellationToken);
        var totalEmsAgencies = await _context.EmsAgencies.CountAsync(cancellationToken);

        var dto = new AnalyticsDto
        {
            TotalHospitals = totalHospitals,
            ActiveHospitals = activeHospitals,
            TotalDropdownCategories = totalDropdownCategories,
            ActiveDropdownOptions = activeDropdownOptions,
            TotalEmsAgencies = totalEmsAgencies,
            GeneratedAt = DateTime.UtcNow
        };

        return dto;
    }
}
