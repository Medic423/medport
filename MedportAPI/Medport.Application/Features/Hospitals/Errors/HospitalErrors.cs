using Medport.Application.Common.Common.Responses;

namespace Medport.Application.Tracc.Features.Hospitals.Errors;

public static class HospitalErrors
{
    public static Error NotFound(string code, Guid id) => Error.NotFound(
        code,
        $"A Hospital with the guid {id} was not found."
    );
}
