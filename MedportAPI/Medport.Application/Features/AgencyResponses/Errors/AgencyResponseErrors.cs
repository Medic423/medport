using Medport.Application.Common.Common.Responses;

namespace Medport.Application.Tracc.Features.AgencyResponses.Errors;

public static class AgencyResponseErrors
{
    public static Error NotFound(string code, string message) => Error.NotFound(code, message);
}
