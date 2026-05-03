using MediatR;

namespace EventPlatform.Application.Registrations.Queries.GetUserRegistration;

public record GetUserRegistrationQuery(Guid EventId) : IRequest<UserRegistrationDto?>;