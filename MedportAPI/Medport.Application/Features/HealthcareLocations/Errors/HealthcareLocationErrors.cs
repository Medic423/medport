using Medport.Application.Common.Common.Responses;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Errors;

public static class HealthcareLocationErrors
{
    public static Error NotFound(string code, Guid id) => Error.NotFound(
        code,
        $"A Healthcare Location with the guid {id} was not found."
    );
}
