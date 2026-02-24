using AutoMapper;
using Medport.Application.Tracc.Features.DropdownOptions.Commands.Requests;
using Medport.Application.Tracc.Features.DropdownOptions.Queries.Dtos;
using Medport.Domain.Entities;

namespace Medport.Application.Tracc.Features.DropdownOptions.Mappings;

public class DropdownOptionsMappingProfile : Profile
{
    public DropdownOptionsMappingProfile()
    {
        CreateMap<CreateDropdownOptionCommand, DropdownOption>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

        CreateMap<DropdownOption, DropdownOptionDto>();

        CreateMap<DropdownOption, DropdownOptionDto>().ReverseMap();
    }
}
