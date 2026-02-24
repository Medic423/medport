using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Dtos;

public class SubscriptionPlanDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string UserType { get; set; }
    public string MonthlyPrice { get; set; }
    public string AnnualPrice { get; set; }
    public IEnumerable<string> Features { get; set; }
    public int TrialDays { get; set; }
    public bool IsActive { get; set; }
}
