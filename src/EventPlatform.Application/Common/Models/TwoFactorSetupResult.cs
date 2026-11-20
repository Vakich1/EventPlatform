namespace EventPlatform.Application.Common.Models;

public record TwoFactorSetupResult(
    string Secret,
    string AuthenticatorUri,
    bool IsEnabled);
