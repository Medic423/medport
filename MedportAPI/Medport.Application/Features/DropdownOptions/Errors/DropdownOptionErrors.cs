using Medport.Application.Common.Common.Responses;

namespace Medport.Application.Tracc.Features.DropdownOptions.Errors;

public static class DropdownOptionErrors
{
    public static Error NotFound(string code, string message) => Error.NotFound(code, message);
}
