using MediatR;

namespace EventPlatform.Application.Auth.Queries.GetCurrentUser;

public record CurrentUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string Role,
    bool IsApprovedOrganizer,
    bool TwoFactorEnabled,
    bool HasPassword,
    bool LinkedGoogle,
    DateTime CreatedAt);

public record GetCurrentUserQuery : IRequest<CurrentUserDto>;
