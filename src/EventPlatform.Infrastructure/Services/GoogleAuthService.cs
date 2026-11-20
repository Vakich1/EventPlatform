using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace EventPlatform.Infrastructure.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;

    public GoogleAuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["GoogleSettings:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
            throw new DomainException("Google authentication is not configured.");

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [clientId]
            });

            if (string.IsNullOrWhiteSpace(payload.Email) || !payload.EmailVerified)
                throw new DomainException("Google account email is not verified.");

            return new GoogleUserInfo(
                payload.Subject,
                payload.Email,
                payload.GivenName ?? string.Empty,
                payload.FamilyName ?? string.Empty);
        }
        catch (InvalidJwtException)
        {
            throw new DomainException("Invalid Google token.");
        }
    }
}
