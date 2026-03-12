using AutoMapper;
using MediatR;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Medport.Application.Tracc.Features.AgencyResponses.Queries.Handlers;

public class GetAllAgencyResponsesQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAllAgencyResponsesQuery, List<AgencyResponseDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<List<AgencyResponseDto>> Handle(GetAllAgencyResponsesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AgencyResponses.AsQueryable();

        if (request.TransportRequestId.HasValue)
        {
            //query = query.Where(a => a.TransportRequestId == request.TransportRequestId.Value);
        }

        //var list = await query.OrderByDescending(a => a.RespondedAt).ToListAsync(cancellationToken);

        //return list.Select(a => _mapper.Map<AgencyResponseDto>(a)).ToList();
        return null;
    }
}
