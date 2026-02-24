using Medport.Application.Common.Common.Responses;

namespace Medport.Application.Tracc.Features.DropdownCategories.Errors;

public static class DropdownCategoryErrors
{
    public static Error NotFound(string code, string message) => Error.NotFound(code, message);

    public static Error SlugChangeNotAllowed(string code, string message) => Error.Validation(code, message);

    public static Error CannotDeactivateWithActiveOptions(string code, string message) => Error.Conflict(code, message);

    public static Error CannotDeleteWithActiveOptions(string code, string message) => Error.Conflict(code, message);
}
