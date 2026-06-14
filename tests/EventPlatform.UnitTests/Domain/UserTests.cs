using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using FluentAssertions;

namespace EventPlatform.UnitTests.Domain;

public class UserTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateUser()
    {
        var user = User.Create("test@email.com", "hash123", "John", "Doe");

        user.Email.Should().Be("test@email.com");
        user.PasswordHash.Should().Be("hash123");
        user.FirstName.Should().Be("John");
        user.LastName.Should().Be("Doe");
        user.Role.Should().Be(UserRole.User);
        user.IsBlocked.Should().BeFalse();
    }

    [Fact]
    public void Create_WithEmailInUpperCase_ShouldConvertToLowercase()
    {
        var user = User.Create("TEST@EMAIL.COM", "hash", "John", "Doe");

        user.Email.Should().Be("test@email.com");
    }

    [Fact]
    public void Create_WithEmptyEmail_ShouldThrowDomainException()
    {
        Action act = () => User.Create(string.Empty, "hash", "John", "Doe");

        act.Should().Throw<DomainException>()
            .WithMessage("Email cannot be empty.");
    }

    [Fact]
    public void Create_WithEmptyPasswordHash_ShouldThrowDomainException()
    {
        Action act = () => User.Create("test@email.com", string.Empty, "John", "Doe");

        act.Should().Throw<DomainException>()
            .WithMessage("Password hash cannot be empty.");
    }

    [Fact]
    public void Block_UnblockedUser_ShouldBlockUser()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");

        user.Block();

        user.IsBlocked.Should().BeTrue();
    }

    [Fact]
    public void Block_AlreadyBlockedUser_ShouldThrowDomainException()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");
        user.Block();

        Action act = () => user.Block();

        act.Should().Throw<DomainException>()
            .WithMessage("User is already blocked.");
    }

    [Fact]
    public void Unblock_BlockedUser_ShouldUnblockUser()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");
        user.Block();

        user.Unblock();

        user.IsBlocked.Should().BeFalse();
    }

    [Fact]
    public void Unblock_NotBlockedUser_ShouldThrowDomainException()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");

        Action act = () => user.Unblock();

        act.Should().Throw<DomainException>()
            .WithMessage("User is not blocked.");
    }

    [Fact]
    public void SetRefreshToken_ShouldSetTokenAndExpiry()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");
        var expiresAt = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken("token123", expiresAt);

        user.RefreshToken.Should().Be("token123");
        user.RefreshTokenExpiresAt.Should().Be(expiresAt);
    }

    [Fact]
    public void RevokeRefreshToken_ShouldClearToken()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");
        user.SetRefreshToken("token123", DateTime.UtcNow.AddDays(7));

        user.RevokeRefreshToken();

        user.RefreshToken.Should().BeNull();
        user.RefreshTokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public void FullName_ShouldReturnFullName()
    {
        var user = User.Create("test@email.com", "hash", "John", "Doe");

        user.FullName.Should().Be("John Doe");
    }
}
