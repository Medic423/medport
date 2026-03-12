using Medport.Application.Common.Common.Responses;
using Medport.Application.Common.Exceptions;
using Medport.Application.Tracc.Features.Auth.Helpers.Intefaces;
using System.Security.Cryptography;
using System.Text;

namespace Medport.Application.Tracc.Features.Auth.Helpers;

public class AuthenticationHelper: IAuthenticationHelper
{
    public (string, string) DecodeAuth(string encodedAuth)
    {
        // Basic user:pass
        string decodedAuth = Encoding.UTF8.GetString(Convert.FromBase64String(encodedAuth.Split(" ")[1]));
        string[] authParts = decodedAuth.Split(":");

        if (authParts.Length < 2)
        {
            throw new UnauthorizedException(ErrorResult.Failure([Error.Unauthorized(
                $"{nameof(AuthenticationHelper)}.{nameof(DecodeAuth)}", "Unauthorized user")]));
        }

        foreach (string part in authParts)
        {
            if (string.IsNullOrEmpty(part))
            {
                throw new UnauthorizedException(ErrorResult.Failure([Error.Unauthorized(
                    $"{nameof(AuthenticationHelper)}.{nameof(DecodeAuth)}", "Unauthorized user")]));
            }
        }

        return (authParts[0], authParts[1]);
    }

    public string Decrypt(byte[] enc, string cipherKey, string initializationVector)
    {
        try
        {
            var key = GetKey(cipherKey);
            var iv = GetInitializationVector(initializationVector);
            var des = new DESCryptoServiceProvider();

            byte[] inputByteArray = enc;

            var ms = new MemoryStream();
            var cs = new CryptoStream(ms, des.CreateDecryptor(key, iv), CryptoStreamMode.Write);
            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            var encoding = Encoding.UTF8;
            return encoding.GetString(ms.ToArray());
        }
        catch (Exception e)
        {
            throw new ErrorException(
                ErrorResult.Failure(
                    [Error.Unauthorized($"{nameof(AuthenticationHelper)}.Decrypt", e.Message)]));
        }
    }

    public byte[] GetKey(string cipherKey)
    {
        //Dim o As New ConfigurationManager
        byte[] ReturnValue = new byte[8];
        int i = 0;

        foreach (string s in cipherKey.Split(','))
        {
            ReturnValue[i] = Convert.ToByte(s);
            i = i + 1;
        }

        return ReturnValue;
    }

    public byte[] GetInitializationVector(string initializationVector)
    {
        //Dim o As New Configuration.AppSettingsReader
        var ReturnValue = new byte[8];
        int i = 0;

        foreach (var s in initializationVector.Split(','))
        {
            ReturnValue[i] = Convert.ToByte(s);
            i = i + 1;
        }
        return ReturnValue;
    }
}
