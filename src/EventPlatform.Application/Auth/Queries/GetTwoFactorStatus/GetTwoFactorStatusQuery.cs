using MediatR;

namespace EventPlatform.Application.Auth.Queries.GetTwoFactorStatus;

public record TwoFactorStatusDto(bool IsEnabled);

public record GetTwoFactorStatusQuery : IRequest<TwoFactorStatusDto>;
