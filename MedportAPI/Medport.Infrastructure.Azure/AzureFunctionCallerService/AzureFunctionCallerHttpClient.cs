using Medport.Domain.Interfaces;
using Newtonsoft.Json;

namespace Medport.Infrastructure.Azure.AzureFunctionCallerService;

public class AzureFunctionCallerHttpClient : IAzureFunctionCallerHttpClient
{
    private readonly HttpClient _httpClient;
    //private readonly IMCLSettings _settings;

    public AzureFunctionCallerHttpClient(HttpClient httpClient)
    {
        //TODO
        _httpClient = httpClient;

        //string baseURL = settings.GetSetting(Constants.KeyVaults.EnvironmentSecretNames.ThirdPartyAPIsURL);
        //string apiKey = settings.GetSetting(Constants.KeyVaults.EnvironmentSecretNames.ThirdPartyAPIsKey);

        //_httpClient.BaseAddress = new Uri(baseURL);
        //_httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        //_httpClient.DefaultRequestHeaders.Add(Constants.AzureFunctions.AzureFunctionsAuthKeyName,
        //                                 apiKey);
    }

    public async Task<TResponse> Send<TRequest, TResponse>(TRequest request, HttpMethod method, string functionPath, CancellationToken cancellationToken = default)
    {
        HttpRequestMessage message = GetRequestMessage(method, functionPath, request);
        HttpResponseMessage responseMessage = await _httpClient.SendAsync(message, cancellationToken);

        if (responseMessage == null)
        {
            throw new Exception($"Azure Function Call return null response object");
        }

        if (!responseMessage.IsSuccessStatusCode)
        {
            throw new Exception($"Azure Function Call Failed: {responseMessage.StatusCode} - {responseMessage.ReasonPhrase}");
        }

        string responseString = await responseMessage.Content.ReadAsStringAsync(cancellationToken);

        return JsonConvert.DeserializeObject<TResponse>(responseString);
    }

    private HttpRequestMessage GetRequestMessage<TRequestType>(HttpMethod method, string url, TRequestType request)
    {
        string requestJson = JsonConvert.SerializeObject(request);

        return new HttpRequestMessage
        {
            Method = method,
            RequestUri = new Uri(url, UriKind.Relative),
            Content = new StringContent(requestJson)
        };
    }
}
