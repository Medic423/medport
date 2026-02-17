using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Medport.Application.Common.Common.Behaviours;

namespace Medport.Application.Common;

[ExcludeFromCodeCoverage]
public static class ConfigureServices
{
    public static IServiceCollection AddApplicationCommonServices(this IServiceCollection services)
    {
        //SqlMapper.AddTypeHandler(new DbGeographyTypeHandler());

        services.AddMediatR(cfg => {

            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehaviour<,>));
        });
        services.AddHttpClient();

        return services;
    }
}