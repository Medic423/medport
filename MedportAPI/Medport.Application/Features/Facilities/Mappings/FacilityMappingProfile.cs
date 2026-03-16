using AutoMapper;
using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Domain.Entities;

namespace Medport.Application.Tracc.Features.Facilities.Mappings;

public class FacilityMappingProfile : Profile
{
    public FacilityMappingProfile()
    {
        CreateMap<Facility, FacilityDto>();

        CreateMap<CreateFacilityCommand, FacilityDto>();

        CreateMap<UpdateFacilityCommand, FacilityDto>();
    }
}