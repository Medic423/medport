using Medport.Common.Constants;
using Medport.Domain.Interfaces;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace Medport.Infrastructure.Azure;

public class AzureFunctionCaller<requestType, responseType> : IAzureFunctionCaller<requestType, responseType>
{
    string _baseURL;
    string _apiKey;

    public AzureFunctionCaller(string baseURL, string apiKey)
    {
        _baseURL = baseURL;
        _apiKey = apiKey;
    }

    public async Task<responseType?> Send(requestType request, HttpMethod method, string functionPath, CancellationToken cancellationToken = default)
    {
        string url = BuildURL(functionPath);

        HttpClient client = InitClient();
        HttpRequestMessage message = GetRequestMessage(method, url, request);
        HttpResponseMessage responseMessage = await client.SendAsync(message, cancellationToken);
        if (!responseMessage.IsSuccessStatusCode)
        {
            throw new Exception($"Azure Function Call Failed: {responseMessage.StatusCode} - {responseMessage.ReasonPhrase}");
        }

        string responseString = await responseMessage.Content.ReadAsStringAsync(cancellationToken);

        return JsonConvert.DeserializeObject<responseType>(responseString);
    }

    private HttpRequestMessage GetRequestMessage(HttpMethod method, string url, requestType request)
    {
        string requestJson = JsonConvert.SerializeObject(request);

        return new HttpRequestMessage
        {
            Method = method,
            RequestUri = new Uri(url),
            Content = new StringContent(requestJson)
        };
    }

    private HttpClient InitClient()
    {
        HttpClient client = new HttpClient();

        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        client.DefaultRequestHeaders.Add(Constants.AzureFunctions.AzureFunctionsAuthKeyName,
                                         _apiKey);
        return client;
    }

    private string BuildURL(string functionPath)
    {
        return string.Format("{0}{1}", _baseURL, functionPath);
    }
}
