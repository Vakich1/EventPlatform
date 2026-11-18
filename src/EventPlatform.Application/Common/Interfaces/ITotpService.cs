namespace EventPlatform.Application.Common.Interfaces;

public interface ITotpService
{
    string GenerateSecret();
    string GetAuthenticatorUri(string email, string secret);
    bool VerifyCode(string secret, string code);
}
