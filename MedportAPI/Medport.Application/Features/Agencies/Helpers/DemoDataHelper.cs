using Medport.Application.Common.Common.Dtos;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;

namespace Medport.Application.Tracc.Features.Agencies.Helpers;

public static class DemoDataHelper
{
    public static List<TransportRequestDto> DemoRequests()
    {
        return new List<TransportRequestDto>
        {
            new TransportRequestDto
            {
                Id = Guid.NewGuid(),
                PatientId = "PAT-001",
                OriginFacility = new FacilityDto
                {
                    Name = "UPMC Altoona Hospital",
                    Address = "620 Howard Ave",
                    City = "Altoona",
                    State = "PA"
                },
                DestinationFacility = new FacilityDto
                {
                    Name = "Penn State Health Milton S. Hershey Medical Center",
                    Address = "500 University Dr",
                    City = "Hershey",
                    State = "PA"
                },
                TransportLevel = "CCT",
                Priority = "HIGH",
                SpecialRequirements = "Ventilator support, ICU nurse required",
                EstimatedDistance = 45.2,
                EstimatedDuration = 65,
                RevenuePotential = 580,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            }
        };
    }

    public static List<TransportRequestDto> AdminDemoRequests()
    {
        var list = DemoRequests();

        list.Add(new TransportRequestDto
        {
            Id = Guid.NewGuid(),
            PatientId = "PAT-002",
            OriginFacility = new FacilityDto
            {
                Name = "Mount Nittany Medical Center",
                Address = "1800 E Park Ave",
                City = "State College",
                State = "PA"
            },
            DestinationFacility = new FacilityDto
            {
                Name = "Geisinger Medical Center",
                Address = "100 N Academy Ave",
                City = "Danville",
                State = "PA"
            },
            TransportLevel = "ALS",
            Priority = "MEDIUM",
            SpecialRequirements = "Cardiac monitoring",
            EstimatedDistance = 32.8,
            EstimatedDuration = 45,
            RevenuePotential = 420,
            Status = "PENDING",
            CreatedAt = DateTime.UtcNow
        });

        return list;
    }
}
