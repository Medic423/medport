using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Entities;

[Table("Trip")]
public class Trip
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string TripNumber { get; set; }

    public Guid PatientId { get; set; }

    public string? PatientWeight { get; set; }

    public string? SpecialNeeds { get; set; }

    public string FromLocation { get; set; }

    public string ToLocation { get; set; }

    public DateTime ScheduledTime { get; set; }

    public string TransportLevel { get; set; }

    public string UrgencyLevel { get; set; }

    public string? Diagnosis { get; set; }

    public string? MobilityLevel { get; set; }

    public bool OxygenRequired { get; set; }

    public bool MonitoringRequired { get; set; }

    public bool GenerateQRCode { get; set; }

    public string? QrCodeData { get; set; }

    public List<string> SelectedAgencies { get; set; } = new List<string>();

    public int? NotificationRadius { get; set; }

    public DateTime? TransferRequestTime { get; set; }

    public DateTime? TransferAcceptedTime { get; set; }

    public DateTime? EmsArrivalTime { get; set; }

    public DateTime? EmsDepartureTime { get; set; }

    public DateTime? ActualStartTime { get; set; }

    public DateTime? ActualEndTime { get; set; }

    public string Status { get; set; }

    public string Priority { get; set; }

    public string? Notes { get; set; }

    public string? AssignedTo { get; set; }

    public Guid? AssignedAgencyId { get; set; }

    public Guid? AssignedUnitId { get; set; }

    public DateTime? AcceptedTimestamp { get; set; }

    public DateTime? PickupTimestamp { get; set; }

    public DateTime? CompletionTimestamp { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int? ActualTripTimeMinutes { get; set; }

    public bool BackhaulOpportunity { get; set; }

    public int? CompletionTimeMinutes { get; set; }

    public int? CustomerSatisfaction { get; set; }

    public double? DeadheadMiles { get; set; }

    public double? DestinationLatitude { get; set; }

    public double? DestinationLongitude { get; set; }

    public double? DistanceMiles { get; set; }

    public decimal? Efficiency { get; set; }

    public int? EstimatedTripTimeMinutes { get; set; }

    public string? InsuranceCompany { get; set; }

    public decimal? InsurancePayRate { get; set; }

    public decimal? LoadedMiles { get; set; }

    public double? OriginLatitude { get; set; }

    public double? OriginLongitude { get; set; }

    public decimal? PerMileRate { get; set; }

    public decimal? PerformanceScore { get; set; }

    public DateTime? RequestTimestamp { get; set; } = DateTime.UtcNow;

    public int? ResponseTimeMinutes { get; set; }

    public decimal? RevenuePerHour { get; set; }

    public decimal? TripCost { get; set; }

    public Guid? PickupLocationId { get; set; }

    public int? PatientAgeYears { get; set; }

    public string? PatientAgeCategory { get; set; }

    public int MaxResponses { get; set; } = 5;

    public DateTime? ResponseDeadline { get; set; }

    public string ResponseStatus { get; set; } = "PENDING";

    public string SelectionMode { get; set; } = "SPECIFIC_AGENCIES";

    // Navigation properties
    public virtual PickupLocation? PickupLocation { get; set; }
}
