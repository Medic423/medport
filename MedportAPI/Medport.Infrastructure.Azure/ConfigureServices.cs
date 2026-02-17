using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics.CodeAnalysis;
using Medport.Infrastructure.Azure.AzureFunctionCallerService;
using Medport.Domain.Interfaces;

namespace Medport.Infrastructure.Azure
{
    [ExcludeFromCodeCoverage]
    public static class ConfigureAzureInfrastructureServices
    {
        public static IServiceCollection AddAzureInfrastructureServices(this IServiceCollection services)
        {
            //services.AddSingleton<IMCLSettings, MCLSettings>();
            return services;
        }

        public static IServiceCollection AddAzureInfrastructureTypedHttpClients(this IServiceCollection services)
        {
            services.AddHttpClient<IAzureFunctionCallerHttpClient, AzureFunctionCallerHttpClient>();
            return services;
        }
    }
}
