using AutoMapper;
using MediatR;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Agencies.Helpers;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Domain.Interfaces;
using System.Data;

namespace Medport.Application.Tracc.Features.Agencies.Queries;
public class GetAgencyTransportQueryHandler(IApplicationDbContext context, IMapper mapper) : 
    IRequestHandler<CreateHospitalCommand, List<TransportRequestDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<List<TransportRequestDto>> Handle(CreateHospitalCommand request, CancellationToken cancellationToken)
    {
        // ADMIN without agencyId → return demo admin data
        if (string.IsNullOrEmpty(agencyId))
        {
            if (role == "ADMIN")
            {
                return DemoDataHelper.AdminDemoRequests();
            }
        }

        // Demo Mode
        var isDemoMode = authHeader == "Bearer demo-agency-token";
        if (isDemoMode)
        {
            return DemoDataHelper.DemoRequests();
        }

        var requests = await _context.TransportRequests
            .Where(x => x.Status == "PENDING")
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new TransportRequestDto
            {
                Id = x.Id,
                PatientId = x.PatientId,
                OriginFacility = new FacilityDto
                {
                    Name = x.OriginFacility.Name ?? x.FromLocation ?? "Unknown",
                    Address = x.OriginFacility.Address,
                    City = x.OriginFacility.City,
                    State = x.OriginFacility.State
                },
                DestinationFacility = new FacilityDto
                {
                    Name = x.ToLocation ?? "Unknown",
                    Address = "",
                    City = "",
                    State = ""
                },
                TransportLevel = x.TransportLevel,
                Priority = x.Priority,
                SpecialRequirements = x.SpecialRequirements,
                EstimatedDistance = 0,
                EstimatedDuration = 0,
                RevenuePotential = 0,
                Status = x.Status,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return request;
    }
}
