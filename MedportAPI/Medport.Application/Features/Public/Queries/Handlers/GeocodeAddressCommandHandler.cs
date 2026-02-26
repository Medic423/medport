using MediatR;
using Medport.Application.Tracc.Features.Public.Queries.Requests;
using Medport.Application.Tracc.Features.Public.Queries.Dtos;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;

namespace Medport.Application.Tracc.Features.Public.Queries.Handlers;

public class GeocodeAddressCommandHandler : IRequestHandler<GeocodeAddressCommand, GeocodeResultDto>
{
    private static readonly string NominatimBase = "https://nominatim.openstreetmap.org/search";

    public async Task<GeocodeResultDto> Handle(GeocodeAddressCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Address) || string.IsNullOrWhiteSpace(request.City) || string.IsNullOrWhiteSpace(request.State) || string.IsNullOrWhiteSpace(request.ZipCode))
        {
            return new GeocodeResultDto { Success = false, Error = "Address, city, state and zipCode are required" };
        }

        var variations = new[]
        {
            $"{request.Address}, {request.City}, {request.State} {request.ZipCode}",
            $"{request.Address}, {request.City}, {request.State}",
            request.FacilityName != null ? $"{request.FacilityName}, {request.Address}, {request.City}, {request.State} {request.ZipCode}" : null
        };

        using var http = new HttpClient();
        http.DefaultRequestHeaders.UserAgent.ParseAdd("MedportAPI-Geocoder/1.0");
        http.Timeout = System.TimeSpan.FromSeconds(10);

        foreach (var v in variations)
        {
            if (string.IsNullOrWhiteSpace(v)) continue;

            var url = QueryHelpers.AddQueryString(NominatimBase, new Dictionary<string, string>
            {
                ["q"] = v,
                ["format"] = "json",
                ["limit"] = "1",
                ["addressdetails"] = "1",
                ["countrycodes"] = "us"
            });

            try
            {
                var resp = await http.GetAsync(url, cancellationToken);
                if (!resp.IsSuccessStatusCode) continue;

                var json = await resp.Content.ReadAsStringAsync(cancellationToken);
                var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
                {
                    var first = root[0];
                    if (first.TryGetProperty("lat", out var latEl) && first.TryGetProperty("lon", out var lonEl))
                    {
                        if (double.TryParse(latEl.GetString(), out var lat) && double.TryParse(lonEl.GetString(), out var lon))
                        {
                            return new GeocodeResultDto { Success = true, Latitude = lat, Longitude = lon };
                        }
                    }
                }
            }
            catch (System.Exception ex)
            {
                // log if logging available
            }
        }

        return new GeocodeResultDto { Success = false, Error = "Could not find coordinates for this address" };
    }
}
