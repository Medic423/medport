using MediatR;
using Medport.Application.Tracc.Features.Units.Queries.Dtos;

namespace Medport.Application.Tracc.Features.Units.Commands.Requests;

public class CreateUnitCommand : IRequest<UnitDto>
{
    public string UnitNumber { get; set; }
    public string UnitType { get; set; }
    public List<string> Capabilities { get; set; } = [];
    public List<string> CustomCapabilities { get; set; } = [];
    public string? Status { get; set; }
    public string? CurrentStatus { get; set; }
    public bool IsActive { get; set; } = true;

    // Optional agencyId: admins may specify, EMS users will rely on caller info
    public Guid? AgencyId { get; set; }

    // Caller context populated by controller
    public Guid? CallerUserId { get; set; }
    public string? CallerUserType { get; set; }
    public Guid? CallerAgencyId { get; set; }
}
