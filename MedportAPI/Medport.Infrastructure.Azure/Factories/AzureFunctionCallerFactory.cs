using Medport.Domain.Interfaces;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Infrastructure.Azure.Factories;

[ExcludeFromCodeCoverage]
public class AzureFunctionCallerFactory : IAzureFunctionCallerFactory
{
    public IAzureFunctionCaller<TRequest, TResponse> Create<TRequest, TResponse>(string baseUrl, string apiKey)
    {
        return new AzureFunctionCaller<TRequest, TResponse>(baseUrl, apiKey);
    }
}
