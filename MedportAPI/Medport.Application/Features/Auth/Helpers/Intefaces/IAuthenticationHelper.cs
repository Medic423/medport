namespace Medport.Application.Tracc.Features.Auth.Helpers.Intefaces;

public interface IAuthenticationHelper
{
    (string, string) DecodeAuth(string encodedAuth);

    string Decrypt(byte[] enc, string cipherKey, string initializationVector);

    byte[] GetKey(string cipherKey);

    byte[] GetInitializationVector(string initializationVector);
}
