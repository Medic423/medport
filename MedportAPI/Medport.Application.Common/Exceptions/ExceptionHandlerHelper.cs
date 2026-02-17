using FluentValidation.Results;
using Medport.Application.Common.Common.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Net;

namespace Medport.Application.Common.Exceptions;

public static class ExceptionHandlerHelper
{
    public static async Task HandleExceptionAsync<T>(T httpContext, Exception exception)
    {
        switch (exception)
        {
            case ErrorException:
                {
                    var errorException = exception as ErrorException;

                    var errorType = errorException?.ErrorResult.Errors != null
                            && errorException.ErrorResult.Errors.Count > 0
                            ? errorException.ErrorResult.Errors.First().Type : ErrorType.Failure;

                    if (httpContext?.GetType().BaseType == typeof(FunctionContext)) // Function Exception Context
                    {
                        var functionContext = httpContext as FunctionContext;
                        var request = await functionContext!.GetHttpRequestDataAsync();
                        var response = request!.CreateResponse();

                        response!.StatusCode = (HttpStatusCode)GetStatusCode(errorType);
                        await response!.WriteStringAsync(JsonConvert.SerializeObject(errorException?.ErrorResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                    else // Web API Exception Context
                    {
                        var apiContext = httpContext as HttpContext;
                        apiContext!.Response.ContentType = "application/json";

                        apiContext.Response.StatusCode = GetStatusCode(errorType);
                        await apiContext.Response.WriteAsync(JsonConvert.SerializeObject(errorException?.ErrorResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                }
                break;
            case FluentValidation.ValidationException:
                {
                    var validationException = exception as FluentValidation.ValidationException;
                    ICollection<Error> results = [];
                    IEnumerable<ValidationFailure> errors = errors = validationException!.Errors;

                    foreach (var error in errors)
                    {
                        Error Validation() => Error.Validation(
                            error.ErrorCode,
                            error.ErrorMessage
                        );
                        results.Add(Validation());
                    }

                    if (httpContext?.GetType().BaseType == typeof(FunctionContext)) // Function Exception Context
                    {
                        var functionContext = httpContext as FunctionContext;
                        var request = await functionContext!.GetHttpRequestDataAsync();
                        var response = request!.CreateResponse();

                        response!.StatusCode = HttpStatusCode.BadRequest;
                        await response!.WriteStringAsync(JsonConvert.SerializeObject(ErrorResult.Failure(results).ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                    else // Web API Exception Context
                    {
                        var apiContext = httpContext as HttpContext;
                        apiContext!.Response.ContentType = "application/json";

                        apiContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await apiContext.Response.WriteAsync(JsonConvert.SerializeObject(
                            ErrorResult.Failure(results).ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                }
                break;
            case ForbiddenException:
                {
                    var forbiddenException = exception as ForbiddenException;

                    if (httpContext?.GetType().BaseType == typeof(FunctionContext)) // Function Exception Context
                    {
                        var functionContext = httpContext as FunctionContext;
                        var request = await functionContext!.GetHttpRequestDataAsync();
                        var response = request!.CreateResponse();

                        response!.StatusCode = HttpStatusCode.Forbidden;
                        await response!.WriteStringAsync(JsonConvert.SerializeObject(forbiddenException?.ErrorResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                    else // Web API Exception Context
                    {
                        var apiContext = httpContext as HttpContext;
                        apiContext!.Response.ContentType = "application/json";

                        apiContext.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await apiContext.Response.WriteAsync(JsonConvert.SerializeObject(forbiddenException?.ErrorResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                }
                break;
            case UnauthorizedException:
                {
                    var unauthorizedException = exception as UnauthorizedException;

                    if (httpContext?.GetType().BaseType == typeof(FunctionContext)) // Function Exception Context
                    {
                        var functionContext = httpContext as FunctionContext;
                        var request = await functionContext!.GetHttpRequestDataAsync();
                        var response = request!.CreateResponse();

                        response!.StatusCode = HttpStatusCode.Unauthorized;
                        await response!.WriteStringAsync(JsonConvert.SerializeObject(unauthorizedException?.ErrorResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                    else // Web API Exception Context
                    {
                        var apiContext = httpContext as HttpContext;
                        apiContext!.Response.ContentType = "application/json";

                        apiContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await apiContext.Response.WriteAsync(JsonConvert.SerializeObject(unauthorizedException?.ErrorResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                }
                break;
            case WarningException:
                {
                    var warningException = exception as WarningException;

                    if (httpContext?.GetType().BaseType == typeof(FunctionContext)) // Function Exception Context
                    {
                        var functionContext = httpContext as FunctionContext;
                        var request = await functionContext!.GetHttpRequestDataAsync();
                        var response = request!.CreateResponse();

                        response!.StatusCode = HttpStatusCode.BadRequest;
                        await response!.WriteStringAsync(JsonConvert.SerializeObject(warningException?.WarningResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                    else // Web API Exception Context
                    {
                        var apiContext = httpContext as HttpContext;
                        apiContext!.Response.ContentType = "application/json";

                        apiContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await apiContext.Response.WriteAsync(JsonConvert.SerializeObject(warningException?.WarningResult.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                }
                break;
            default:
                {
                    if (httpContext?.GetType().BaseType == typeof(FunctionContext)) // Function Exception Context
                    {
                        var functionContext = httpContext as FunctionContext;
                        var request = await functionContext!.GetHttpRequestDataAsync();
                        var response = request!.CreateResponse();

                        var title = GetTitle(exception);
                        response!.StatusCode = HttpStatusCode.InternalServerError;
                        var result = ErrorResult.Failure([Error.Failure($"{StatusCodes.Status500InternalServerError}", $"{title}")]);
                        await response!.WriteStringAsync(JsonConvert.SerializeObject(result.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                    else // Web API Exception Context
                    {
                        var apiContext = httpContext as HttpContext;
                        var title = GetTitle(exception);
                        apiContext!.Response.StatusCode = StatusCodes.Status500InternalServerError;
                        var result = ErrorResult.Failure([Error.Failure($"{StatusCodes.Status500InternalServerError}", $"{title}")]);
                        await apiContext.Response.WriteAsync(JsonConvert.SerializeObject(result.ToProblemDetails(),
                            new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
                    }
                }
                break;
        }
    }

    private static IResult ToProblemDetails(this ErrorResult result)
    {
        if (result.Errors != null && result.Errors.Count > 0)
        {
            return Results.Problem(
            statusCode: GetStatusCode(result.Errors.First().Type),
            title: GetTitle(result.Errors.First().Type),
            detail: result.Errors.First().ErrorMessage,
            type: GetType(result.Errors.First().Type),
            extensions: new Dictionary<string, object?>
            {
                { "errors", result.Errors },
                { "warnings", result.Warnings }
            });
        }
        else if (result.Warnings != null && result.Warnings.Count > 0)
        {
            return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: GetTitle(ErrorType.Validation),
            detail: result.Warnings.First().WarningMessage,
            type: "https://datatracker.ietf.org/doc/html/rfc9110#name-400-bad-request",
            extensions: new Dictionary<string, object?>
            {
                { "errors", result.Errors },
                { "warnings", result.Warnings }
            });
        }

        return Results.Problem(
            statusCode: StatusCodes.Status500InternalServerError,
            title: "Server Error",
            detail: "Internal Server Error",
            type: "https://datatracker.ietf.org/doc/html/rfc9110#name-500-internal-server-error",
            extensions: new Dictionary<string, object?>
            {
                { "errors", result.Errors },
                { "warnings", result.Warnings }
            });

        static int GetStatusCode(ErrorType errorType) =>
            errorType switch
            {
                ErrorType.Validation => StatusCodes.Status400BadRequest,
                ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorType.Conflict => StatusCodes.Status409Conflict,
                _ => StatusCodes.Status500InternalServerError
            };

        static string GetTitle(ErrorType errorType) =>
            errorType switch
            {
                ErrorType.Validation => "Bad Request",
                ErrorType.NotFound => "Not Found",
                ErrorType.Conflict => "Conflict",
                _ => "Server Error"
            };

        static string GetType(ErrorType errorType) =>
           errorType switch
           {
               ErrorType.Validation => "https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.1",
               ErrorType.NotFound => "https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.5",
               ErrorType.Conflict => "https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.10",
               _ => "https://datatracker.ietf.org/doc/html/rfc9110#section-15.6.1"
           };
    }

    private static int GetStatusCode(ErrorType errorType)
    {
        return errorType switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };
    }

    private static string GetTitle(Exception exception) =>
        exception switch
        {
            ApplicationException applicationException => applicationException.Message,
            FluentValidation.ValidationException => "Validation Error",
            _ => exception.Message
        };
}