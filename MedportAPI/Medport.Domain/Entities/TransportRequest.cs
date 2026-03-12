using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("TransportRequest")]
public class TransportRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string? TripNumber { get; set; }

    public Guid PatientId { get; set; }

    public string? PatientWeight { get; set; }

    public string? SpecialNeeds { get; set; }

    public Guid? OriginFacilityId { get; set; }

    public Guid? DestinationFacilityId { get; set; }

    public string? FromLocation { get; set; }

    public string? ToLocation { get; set; }

    public Guid? FromLocationId { get; set; }

    public bool IsMultiLocationFacility { get; set; }

    public DateTime? ScheduledTime { get; set; }

    public string TransportLevel { get; set; }

    public string? UrgencyLevel { get; set; }

    public string Priority { get; set; } = "MEDIUM";

    public string Status { get; set; } = "PENDING";

    public string? SpecialRequirements { get; set; }

    public string? Diagnosis { get; set; }

    public string? MobilityLevel { get; set; }

    public bool OxygenRequired { get; set; }

    public bool MonitoringRequired { get; set; }

    public bool GenerateQRCode { get; set; }

    public string? QrCodeData { get; set; }

    public List<string> SelectedAgencies { get; set; } = new List<string>();

    public int? NotificationRadius { get; set; }

    public DateTime RequestTimestamp { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedTimestamp { get; set; }

    public DateTime? PickupTimestamp { get; set; }

    public DateTime? ArrivalTimestamp { get; set; }

    public DateTime? DepartureTimestamp { get; set; }

    public DateTime? CompletionTimestamp { get; set; }

    public DateTime? HealthcareCompletionTimestamp { get; set; }

    public DateTime? EmsCompletionTimestamp { get; set; }

    public Guid? PickupLocationId { get; set; }

    public Guid? AssignedAgencyId { get; set; }

    public Guid? AssignedUnitId { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public bool Isolation { get; set; }

    public bool Bariatric { get; set; }

    public string? Notes { get; set; }

    public int? PatientAgeYears { get; set; }

    public string? PatientAgeCategory { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Unit? AssignedUnit { get; set; }

    public virtual Facility? DestinationFacility { get; set; }

    public virtual Facility? FromFacility { get; set; }

    public virtual Facility? OriginFacility { get; set; }

    public virtual PickupLocation? PickupLocation { get; set; }

    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<AgencyResponse> AgencyResponses { get; set; } = new List<AgencyResponse>();
}