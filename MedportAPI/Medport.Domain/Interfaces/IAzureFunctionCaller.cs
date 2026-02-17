namespace Medport.Domain.Interfaces;

public interface IAzureFunctionCaller<requestType, responseType>
{
    Task<responseType?> Send(
        requestType request, 
        HttpMethod method, 
        string functionPath, 
        CancellationToken cancellationToken = default
    );
}
