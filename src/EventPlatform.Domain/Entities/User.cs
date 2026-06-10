using EventPlatform.Domain.Common;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;

namespace EventPlatform.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } =  string.Empty;
    public string PasswordHash { get; private set; } =  string.Empty;
    public string FirstName { get; private set; } =  string.Empty;
    public string LastName { get; private set; } =  string.Empty;
    public UserRole Role { get; private set; } = UserRole.User;
    public bool IsBlocked { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiresAt { get; private set; }

    private readonly List<Event> _organizedEvents = [];
    public IReadOnlyCollection<Event> OrganizedEvents => _organizedEvents.AsReadOnly();
    
    private User() {}

    public static User Create(string email, string passwordHash, string firstName, string lastName)
    {
        if (string.IsNullOrEmpty(email))
            throw new DomainException("Email cannot be empty.");
        
        if (string.IsNullOrEmpty(passwordHash))
            throw new DomainException("Password hash cannot be empty.");

        return new User
        {
            Email = email.ToLowerInvariant().Trim(),
            PasswordHash = passwordHash,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
        };
    }
    
    public void SetRole(UserRole role)
    {
        Role = role;
        SetUpdatedAt();
    }
    
    public void Block()
    {
        if (IsBlocked)
            throw new DomainException("User is already blocked.");

        IsBlocked = true;
        SetUpdatedAt();
    }

    public void Unblock()
    {
        if (!IsBlocked)
            throw new DomainException("User is not blocked.");

        IsBlocked = false;
        SetUpdatedAt();
    }

    public void SetRefreshToken(string token, DateTime expiresAt)
    {
        RefreshToken = token;
        RefreshTokenExpiresAt = expiresAt;
        SetUpdatedAt();
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiresAt = null;
        SetUpdatedAt();
    }
    
    public string FullName => $"{FirstName} {LastName}";
}