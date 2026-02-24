namespace Medport.Application.Tracc.Features.Public.Queries.Dtos;

public class GeocodeResultDto
{
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool Success { get; set; }
    public string Error { get; set; }
}
