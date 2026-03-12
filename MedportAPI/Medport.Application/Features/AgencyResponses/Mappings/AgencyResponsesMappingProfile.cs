using AutoMapper;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Domain.Entities;

namespace Medport.Application.Tracc.Features.AgencyResponses.Mappings;

public class AgencyResponsesMappingProfile : Profile
{
    public AgencyResponsesMappingProfile()
    {
        CreateMap<CreateAgencyResponseCommand, AgencyResponse>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            //.ForMember(dest => dest.RespondedAt, opt => opt.Ignore());

        CreateMap<AgencyResponse, AgencyResponseDto>();
        CreateMap<AgencyResponseDto, AgencyResponse>();
    }
}
