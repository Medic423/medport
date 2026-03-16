using Medport.Application.Common.Common.Responses;

namespace Medport.Application.Tracc.Features.Facilities.Errors;

public static class FacilityErrors
{
    public static Error NotFound(string code, Guid id) => Error.NotFound(
        code,
        $"A Facility with the guid {id} was not found."
    );
}
