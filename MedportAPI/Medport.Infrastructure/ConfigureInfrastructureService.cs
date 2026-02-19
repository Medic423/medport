using Medport.Domain.Interfaces;
using Medport.Infrastructure.Persistence.Dapper;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Medport.Infrastructure.Persistence.EntityFramework;

namespace Medport.Infrastructure;

[ExcludeFromCodeCoverage]
public static class ConfigureInfrastructureService
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        //IMCLSettings settings = services.BuildServiceProvider().GetRequiredService<IMCLSettings>();
        string heroConnectionString = "TODO";//settings.GetSetting(Constants.KeyVaults.EnvironmentSecretNames.HeroConnString);

        services.AddDbContext<IApplicationDbContext, ApplicationDbContext>(options =>
            options.UseSqlServer(heroConnectionString,
                builder =>
                {
                    builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    builder.EnableRetryOnFailure();
                }
                ));
        services.AddScoped<IDapperConnectionFactory, DapperConnectionFactory>();

        return services;
    }


    public static void RegisterDapperRepositories(this IServiceCollection services)
    {
        services.AddScoped<IDapperConnectionFactory, DapperConnectionFactory>();
    }

    public static void AddCommonInfrastructureServices(this IServiceCollection services)
    {
    }
}
