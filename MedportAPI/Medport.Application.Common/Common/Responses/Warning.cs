using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Common.Common.Responses;

[ExcludeFromCodeCoverage]
public record Warning
{
    private Warning(string code, string description)
    {
        Code = code;
        WarningMessage = description;
        Type = WarningType.Warning;
    }

    public string Code { get; }
    public string WarningMessage { get; }
    public WarningType Type { get; }

    public static Warning Validation(string code, string description) => new(code, description);

    public enum WarningType
    {
        Warning = 0
    }
}