using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Common.Constants;

public class Constants
{
    public static class AzureFunctions
    {
        public static string AzureFunctionsAuthKeyName = "x-functions-key";
    }

    public static class Error
    {
        public const string ModelValidationAttributeInvalid = "ModelValidationAttribute.ActionFilter.Invalid";
    }
}
