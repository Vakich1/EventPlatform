using EventPlatform.Domain.Entities;

namespace EventPlatform.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string GenerateTwoFactorToken(Guid userId);
    Guid? ValidateTwoFactorToken(string token);
}