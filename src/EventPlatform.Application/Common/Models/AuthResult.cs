namespace EventPlatform.Application.Common.Models;

public record AuthResult(
    string? AccessToken,
    string? RefreshToken,
    DateTime? ExpiresAt,
    bool RequiresTwoFactor = false,
    string? TwoFactorToken = null);
