using AutoMapper;
using Medport.Application.Tracc.Features.AgencyResponses.Commands.Requests;
using Medport.Application.Tracc.Features.AgencyResponses.Queries.Dtos;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using Medport.Domain.Entities;

namespace Medport.Application.Tracc.Features.Hospitals.Mappings;

public class HospitalMappingProfile : Profile
{
    public HospitalMappingProfile()
    {
        CreateMap<Hospital, HospitalDto>();

        CreateMap<CreateHospitalCommand, Hospital>();

        CreateMap<UpdateHospitalCommand, Hospital>();

        CreateMap<ApproveHospitalCommand, Hospital>();

        CreateMap<RejectHospitalCommand, Hospital>();
    }
}



