using EventPlatform.Application.Common.Interfaces;
using OtpNet;

namespace EventPlatform.Infrastructure.Services;

public class TotpService : ITotpService
{
    private const string Issuer = "EventPlatform";

    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(key);
    }

    public string GetAuthenticatorUri(string email, string secret)
    {
        var encodedIssuer = Uri.EscapeDataString(Issuer);
        var encodedEmail = Uri.EscapeDataString(email);
        return $"otpauth://totp/{encodedIssuer}:{encodedEmail}?secret={secret}&issuer={encodedIssuer}&digits=6";
    }

    public bool VerifyCode(string secret, string code)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code))
            return false;

        var cleaned = code.Trim().Replace(" ", string.Empty);
        if (cleaned.Length != 6 || !cleaned.All(char.IsDigit))
            return false;

        var totp = new Totp(Base32Encoding.ToBytes(secret));
        return totp.VerifyTotp(cleaned, out _, new VerificationWindow(1, 1));
    }
}
