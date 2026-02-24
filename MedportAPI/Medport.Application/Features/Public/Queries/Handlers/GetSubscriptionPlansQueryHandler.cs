using MediatR;
using Medport.Application.Tracc.Features.Public.Queries.Requests;
using Medport.Application.Tracc.Features.Public.Queries.Dtos;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Handlers;

public class GetSubscriptionPlansQueryHandler : IRequestHandler<GetSubscriptionPlansQuery, IEnumerable<SubscriptionPlanDto>>
{
    public Task<IEnumerable<SubscriptionPlanDto>> Handle(GetSubscriptionPlansQuery request, CancellationToken cancellationToken)
    {
        var healthcare = new List<SubscriptionPlanDto>
        {
            new SubscriptionPlanDto { Id = "healthcare-free-plan", Name = "FREE", DisplayName = "Free Trial", Description = "7-day free trial to explore TRACC features", UserType = "HEALTHCARE", MonthlyPrice = "0", AnnualPrice = "0", Features = new [] { "Create transport requests", "View available EMS providers", "Track transport status", "Basic analytics", "Email notifications" }, TrialDays = 7, IsActive = true },
            new SubscriptionPlanDto { Id = "healthcare-regular-plan", Name = "REGULAR", DisplayName = "Regular Plan", Description = "Full access to TRACC for small to medium healthcare facilities", UserType = "HEALTHCARE", MonthlyPrice = "99", AnnualPrice = "990", Features = new [] { "All Free Trial features", "Unlimited transport requests", "Advanced analytics and reporting", "Priority support", "SMS notifications", "Multi-location management", "Custom integrations" }, TrialDays = 0, IsActive = true },
            new SubscriptionPlanDto { Id = "healthcare-premium-plan", Name = "PREMIUM", DisplayName = "Premium Plan", Description = "Enterprise features for large healthcare systems", UserType = "HEALTHCARE", MonthlyPrice = "299", AnnualPrice = "2990", Features = new [] { "All Regular Plan features", "Dedicated account manager", "Custom API access", "Advanced route optimization", "White-label options", "24/7 phone support", "Custom training sessions" }, TrialDays = 0, IsActive = true }
        };

        var ems = new List<SubscriptionPlanDto>
        {
            new SubscriptionPlanDto { Id = "ems-free-plan", Name = "FREE", DisplayName = "Free Trial", Description = "7-day free trial to explore TRACC features", UserType = "EMS", MonthlyPrice = "0", AnnualPrice = "0", Features = new [] { "Receive trip notifications", "View available trips", "Accept/decline requests", "Track completed transports", "Basic analytics" }, TrialDays = 7, IsActive = true },
            new SubscriptionPlanDto { Id = "ems-regular-plan", Name = "REGULAR", DisplayName = "Regular Plan", Description = "Full access to TRACC for small to medium EMS agencies", UserType = "EMS", MonthlyPrice = "79", AnnualPrice = "790", Features = new [] { "All Free Trial features", "Unlimited trip responses", "Advanced analytics and reporting", "Priority trip notifications", "SMS notifications", "Multi-unit management", "Route optimization" }, TrialDays = 0, IsActive = true },
            new SubscriptionPlanDto { Id = "ems-premium-plan", Name = "PREMIUM", DisplayName = "Premium Plan", Description = "Enterprise features for large EMS operations", UserType = "EMS", MonthlyPrice = "199", AnnualPrice = "1990", Features = new [] { "All Regular Plan features", "Dedicated account manager", "Custom API access", "Advanced route optimization", "Revenue analytics", "24/7 phone support", "Custom training sessions" }, TrialDays = 0, IsActive = true }
        };

        var plans = request.UserType?.ToUpper() == "EMS" ? (IEnumerable<SubscriptionPlanDto>)ems : healthcare;
        return Task.FromResult(plans);
    }
}
