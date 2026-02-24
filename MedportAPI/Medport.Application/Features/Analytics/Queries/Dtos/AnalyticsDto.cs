
namespace Medport.Application.Tracc.Features.Analytics.Queries.Dtos;

public class AnalyticsDto
{
    public int TotalHospitals { get; set; }
    public int ActiveHospitals { get; set; }
    public int TotalDropdownCategories { get; set; }
    public int ActiveDropdownOptions { get; set; }
    public int TotalEmsAgencies { get; set; }
    public DateTime GeneratedAt { get; set; }
}
