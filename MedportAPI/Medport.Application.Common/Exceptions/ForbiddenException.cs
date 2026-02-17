using Medport.Application.Common.Common.Responses;
using System.Diagnostics.CodeAnalysis;

namespace Medport.Application.Common.Exceptions
{
    [ExcludeFromCodeCoverage]
    public class ForbiddenException(ErrorResult result) : Exception
    {
        public ErrorResult ErrorResult = result;
    }
}
