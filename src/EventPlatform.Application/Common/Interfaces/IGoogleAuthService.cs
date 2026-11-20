namespace EventPlatform.Application.Common.Interfaces;

public record GoogleUserInfo(string Subject, string Email, string FirstName, string LastName);

public interface IGoogleAuthService
{
    Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken, CancellationToken cancellationToken = default);
}
