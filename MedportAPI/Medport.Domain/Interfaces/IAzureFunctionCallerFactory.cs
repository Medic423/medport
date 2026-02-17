namespace Medport.Domain.Interfaces;

public interface IAzureFunctionCallerFactory
{
    IAzureFunctionCaller<TRequest, TResponse> Create<TRequest, TResponse>(string baseUrl, string apiKey);
}