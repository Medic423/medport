using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Medport.API.Tracc.CustomAttributes;

public class ModelValidationAttribute : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            var errorsMessages = context.ModelState.Values.SelectMany(v => v.Errors)
                .Select(s => s.ErrorMessage)
                .ToList();

            var errors = new List<Error>();
            foreach (var msg in errorsMessages)
            {
                errors.Add(Error.Validation(
                    Common.Constants.Constants.Error.ModelValidationAttributeInvalid, msg));
            }

            throw new ErrorException(ErrorResult.Failure(errors != null && errors.Count > 0
                ? errors :
                [Error.Validation(
                    Common.Constants.Constants.Error.ModelValidationAttributeInvalid, "Bad request")]));
        }
        else
        {
            if (next != null)
            {
                await next();
            }
        }
    }
}