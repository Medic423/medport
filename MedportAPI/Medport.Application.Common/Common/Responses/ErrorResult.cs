using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Common.Common.Responses;

[ExcludeFromCodeCoverage]
public class ErrorResult
{
    internal ErrorResult(bool isSuccess, ICollection<Error> errors, ICollection<Warning> warnings)
    {
        IsSuccess = isSuccess;
        Warnings = warnings;
        Errors = errors;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public ICollection<Warning> Warnings { get; }

    public ICollection<Error> Errors { get; }

    public static ErrorResult Failure(ICollection<Error> errors, ICollection<Warning>? warnings = null) =>
        new(false, errors, warnings ?? Array.Empty<Warning>());

    public static ErrorResult Warning(ICollection<Warning> warnings) =>
        new(true, Array.Empty<Error>(), warnings);
}
