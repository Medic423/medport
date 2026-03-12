using FluentValidation;
using MediatR;
using Medport.Application.Common.Common.Behaviours;
using Medport.Application.Tracc.Features.Auth.Helpers;
using Medport.Application.Tracc.Features.Auth.Helpers.Intefaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace Medport.Application.Tracc;

[ExcludeFromCodeCoverage]
public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // services.AddAutoMapper(System.AppDomain.CurrentDomain.GetAssemblies());
        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviorVoid<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehaviour<,>));
        });
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly(), includeInternalTypes: true);

        services.AddScoped<IAuthenticationHelper, AuthenticationHelper>();

        return services;
    }

    public static IServiceCollection InstantiateApplicationHeroSettings(this IServiceCollection services, IConfiguration configuration)
    {
        // TODO
        //IMCLSettings mclSettings = services.BuildServiceProvider().GetRequiredService<IMCLSettings>();

        // CM2 settings            
        //string environmentKeyVaultURI = configuration[Constants.KeyVaults.KeyVaultAppSettingsKeys.EnvironmentKeyVaultURI];
        //mclSettings.InstantiateEnvironmentSettings(environmentKeyVaultURI);

        //string heroKeyVaultURI = configuration[Constants.KeyVaults.KeyVaultAppSettingsKeys.HeroKeyVaultURI];
        //mclSettings.InstantiateSupportingSettings(heroKeyVaultURI, Constants.KeyVaults.KeyVaultNames.Hero);

        return services;
    }
}
