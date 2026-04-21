using EventPlatform.Domain.Entities;

namespace EventPlatform.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}